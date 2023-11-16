const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator } } = require('../../config')
const callArchiveTemplate = require('../call-archive-template')
const HTTPError = require('../http-error')

const comparePrivatePersonToFreg = (fregPerson, privatePerson) => {
  if (!privatePerson.PrivateAddress) return false
  if (fregPerson.streetAddress.toLowerCase() !== privatePerson.PrivateAddress.StreetAddress.toLowerCase()) return false
  if (fregPerson.zipCode !== privatePerson.PrivateAddress.ZipCode) return false
  if (fregPerson.zipPlace !== privatePerson.PrivateAddress.ZipPlace) return false
  if (fregPerson.firstName !== privatePerson.FirstName) return false
  if (fregPerson.lastName !== privatePerson.LastName) return false
  return true
}

module.exports = async (personData, context) => {
  const { ssn, oldSsn, firstName, lastName, streetAddress, zipCode, zipPlace, addressCode, addressProtection } = personData
  if (!ssn) {
    throw new HTTPError(400, 'Missing required parameter "personData.ssn"')
  }
  if (!oldSsn) {
    throw new HTTPError(400, 'Could not find oldSsn variable, something is wrong in the code, oh-oh')
  }
  if (!firstName) {
    throw new HTTPError(400, 'Missing required parameter "personData.firstName"')
  }
  if (!lastName) {
    throw new HTTPError(400, 'Missing required parameter "personData.lastName"')
  }
  if (!streetAddress) {
    throw new HTTPError(400, 'Missing required parameter "personData.streetAddress"')
  }
  if (!zipCode) {
    throw new HTTPError(400, 'Missing required parameter "personData.zipCode"')
  }
  if (!zipPlace) {
    throw new HTTPError(400, 'Missing required parameter "personData.zipPlace"')
  }
  if (!addressCode) {
    throw new HTTPError(400, 'Missing required parameter "personData.addressCode"')
  }
  if (!Array.isArray(addressProtection)) {
    throw new HTTPError(400, 'Missing required parameter "personData.addressProtection"')
  }

  const person = {
    ssn,
    oldSsn,
    firstName,
    lastName,
    streetAddress,
    zipCode,
    zipPlace,
    addressCode,
    addressProtection,
    recno: 0,
    updated: false,
    updatedSsn: false
  }

  // Egen håndtering om det er adressesperring i selve adressen
  const addressBlockCodes = ['klientadresse', 'fortrolig']
  if (addressBlockCodes.includes(addressCode)) {
    personData.streetAddress = `Sperret adresse (${addressCode})`
    // Hvis ikke eksisterer på nytt fnr, lag ny, send mail. Hvis eksisterer på nyeste fnr, itj oppdater - send videre i retur - kan hende skal gis beskjed om man endrer på saker
    const privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn } }, context)
    if (privatePersonRes.length === 1 && privatePersonRes[0].PersonalIdNumber) { // If it already exists
      if (privatePersonRes[0].PrivateAddress && privatePersonRes[0].PrivateAddress.StreetAddress && !(privatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('sperret'))) { // Hvis den itj er "sperret" i arkivet
        const updatedPrivatePerson = await callArchiveTemplate({ system: 'archive', template: 'update-private-person', parameter: { ...personData, recno: privatePersonRes[0].Recno } }, context) // Så oppdaterer vi den i arkivet - Returns recno of updated privatePerson
        if (Number(updatedPrivatePerson)) {
          person.recno = updatedPrivatePerson
          person.updated = true
        } else {
          throw new HTTPError(500, 'Archive did not return recno and not error, what?')
        }
        // Send mail til 360 administrator om at dette er en adressesperring, som manglet dette i 360
        const mailStrBlock = `Arkiveringsroboten oppdaterte en person med adressesperring i Public 360.<br>Roboten har oppdatert privatpersonen slik at adressen ikke synes, men adressesperrekontakt kan sjekke hva den var tidligere og vurdere om det heller skal deaktiveres og lages en ny privatperson.<br><br>Privatperson det gjelder har <strong>Recno: ${privatePersonRes[0].Recno}</strong>`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'VIKTIG: Oppdaget adressesperre!',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block in FREG but not in P360, updated privatePerson with "Recno: ${privatePersonRes[0].Recno}" and sent mail to address block-contact`], context)
      } else {
        // Trenger ikke oppdatere - har allerede sperret adresse
        logger('info', ['syncPrivatePerson', `Found address block both in FREG and P360, will not update privatePerson with "Recno: ${privatePersonRes[0].Recno}"`], context)
        person.recno = privatePersonRes[0].Recno
      }
    } else if (privatePersonRes.length === 0) {
      const newPrivatePersonRecno = await callArchiveTemplate({ system: 'archive', template: 'create-private-person', parameter: personData }, context) // Returns recno of created privatePerson
      if (Number(newPrivatePersonRecno)) {
        person.recno = newPrivatePersonRecno
      } else {
        throw new HTTPError(500, 'Archive did not return recno and not error, what?')
      }
      // Send mail til 360 administrator om at det er opprettet privatperson med adressesperre
      const mailStrBlock = `Arkiveringsroboten har opprettet en ny privatperson med adressesperring i Public 360.<br><br>Privatperson det gjelder har <strong>Recno: ${newPrivatePersonRecno}</strong>`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'VIKTIG: Opprettet privatperson med adressesperre!',
        body: mailStrBlock
      })
      logger('info', ['syncPrivatePerson', `Found address block in FREG but no existing privatePerson in P360. Created PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`], context)
    } else {
      // Send mail til 360 administrator om at det er funnet flere privatpersoner med samme fnr og adressesperre i p360
      logger('error', ['syncPrivatePerson', `Several privatePersons found on social security number: ${ssn}, send to arkiv-administrator for handling`], context)
      throw new HTTPError(500, `Several privatePersons found on social security number: ${ssn}, send to arkiv-administrator for handling`)
    }
    return person
  }
  // Ferdig med adressesperre-håndtering

  const flow = {
    oldPrivatePersonRes: false,
    privatePersonRes: false,
    hasOldPrivatePerson: false,
    hasPrivatePerson: false,
    oldHasP360AddressBlock: false,
    hasP360AddressBlock: false,
    hasFregAddressProtection: addressProtection.some(ele => ['strengtfortrolig', 'fortrolig'].includes(ele.toLowerCase()))
  }

  // Hvis nytt fnr - sjekk om det finnes privatperson på det gamle og det nye - hvis begge eksisterer, send mail til arkiv om at det må ryddes. Hvis det bare eksisterer privatperson på det gamle, oppdater denne med nytt fnr. Hvis det ikke eksisterer noen, opprett ny privatperson med det nye fnr. Hvis det bare eksisterer på det nye - wtf?? Gjør som vanlig tipper jeg (Kan bekrefte nå i ettertid at "gjør som vanlig" stemmer).
  flow.privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn } }, context)
  if (flow.privatePersonRes.length === 1 && flow.privatePersonRes[0].PersonalIdNumber) {
    flow.hasPrivatePerson = true
    if (flow.privatePersonRes[0].PrivateAddress && flow.privatePersonRes[0].PrivateAddress.StreetAddress && (flow.privatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('sperret') || flow.privatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('klient'))) flow.hasP360AddressBlock = true
  } else if (flow.privatePersonRes.length > 1) {
    logger('error', ['syncPrivatePerson', `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`], context)
    throw new HTTPError(500, `Several privatePersons found on social security number: ${ssn}, send to arkivarer for handling`)
  }
  if (ssn !== oldSsn) {
    flow.oldPrivatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn: oldSsn } }, context)
    if (flow.oldPrivatePersonRes.length === 1 && flow.oldPrivatePersonRes[0].PersonalIdNumber) {
      flow.hasOldPrivatePerson = true
      if (flow.oldPrivatePersonRes[0].PrivateAddress && flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress && (flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('sperret') || flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress.toLowerCase().includes('klient'))) flow.oldHasP360AddressBlock = true
    } else if (flow.oldPrivatePersonRes.length > 1) {
      logger('error', ['syncPrivatePerson', `Several privatePersons found on old social security number: ${oldSsn}, send tre arkivarer på handletur`], context)
      throw new HTTPError(500, `Several privatePersons found on old social security number: ${oldSsn}, send tre arkivarer for handling`)
    }
  }
  if (!flow.hasOldPrivatePerson && !flow.hasPrivatePerson) { // Har ingen privatperson i P360, hverken på gammelt eller nytt fnr
    // Create privateperson
    const newPrivatePersonRecno = await callArchiveTemplate({ system: 'archive', template: 'create-private-person', parameter: personData }, context) // Returns recno of created privatePerson
    if (!isNaN(newPrivatePersonRecno)) {
      person.recno = newPrivatePersonRecno
    } else {
      console.log(newPrivatePersonRecno)
      throw new HTTPError(500, 'Archive did not return recno and not error, what?')
    }
    if (flow.hasFregAddressProtection) {
      // Send mail til 360 administrator om at det er laget en kontakt som har adressesbeskyttelse i FREG.
      const mailStrBlock = `Arkiveringsroboten har laget en privatperson i P360 som har addressebeskyttelse, sjekk gjerne at alt er på stell i forhold til deres rutiner.<br><br>`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'TIL INFO: Opprettet privatperson med adressebeskyttelse i 360',
        body: mailStrBlock
      })
      logger('info', ['syncPrivatePerson', `Found address protection on privatePerson in FREG. Created privateperson "Recno: ${person.recno}" and sent mail to address block-contact`], context)
    }
  } else if (flow.hasOldPrivatePerson && !flow.hasPrivatePerson) { // Har privatperson i P360 på gammelt fnr, oppdaterer denne privatpersonen med nytt fnr
    // Update old privateperson with new ssn
    if (flow.oldHasP360AddressBlock) { // Special case, new fnr, no address block in FREG, but address block in P360
      const specialCaseData = {
        recno: flow.oldPrivatePersonRes[0].Recno,
        firstName,
        lastName,
        ssn,
        streetAddress: flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress,
        zipCode: flow.oldPrivatePersonRes[0].PrivateAddress.ZipCode,
        zipPlace: flow.oldPrivatePersonRes[0].PrivateAddress.ZipPlace
      }
      // Skreller vekk reell adresse fra person i tillegg
      person.streetAddress = flow.oldPrivatePersonRes[0].PrivateAddress.StreetAddress
      person.zipCode = flow.oldPrivatePersonRes[0].PrivateAddress.ZipCode
      person.zipPlace = flow.oldPrivatePersonRes[0].PrivateAddress.ZipPlace
      const updatedPrivatePerson = await callArchiveTemplate({ system: 'archive', template: 'update-private-person', parameter: specialCaseData }, context) // Returns recno of updated privatePerson
      if (!isNaN(updatedPrivatePerson)) {
        person.recno = updatedPrivatePerson
        person.updated = true
        person.updatedSsn = true
      } else {
        throw new HTTPError(500, 'Archive did not return recno and not error, what?')
      }
      if (flow.hasFregAddressProtection) {
        // Send mail til 360 administrator om at det er oppdatert en kontakt som har adressesperring i 360 og addressebeskyttelse i FREG. Har kun oppdatert fødselsnummer på kontakten, men de bør sjekke at alt er på stell
        const mailStrBlock = `Arkiveringsroboten har oppdatert fødselsnummer på en privatperson med adressesperring i Public 360 og adressebeskyttelse i FREG.<br><br>Privatperson det gjelder har <strong>Recno: ${updatedPrivatePerson}</strong><br><br>Det bør undersøkes om personen er satt riktig i forhold til deres rutiner.`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'TIL INFO: Privatperson med adressesperre i 360, og adressebsekyttelse i FREG',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, and address protection in FREG. Updated only ssn on PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`], context)
      } else {
        // Send mail til 360 administrator om at det er oppdatert en kontakt som har adressesperring i 360 men ikke i FREG. Har kun oppdatert fødselsnummer på kontakten, men de bør sjekke opp om personen skal ha adressesperre eller ikke - sjekke at alt er på stell
        const mailStrBlock = `Arkiveringsroboten har oppdatert fødselsnummer på en privatperson med adressesperring i Public 360, men som ikke har adressesperre i Infotorg.<br><br>Privatperson det gjelder har <strong>Recno: ${updatedPrivatePerson}</strong><br><br>Det bør undersøkes om personen skal ha adressesperre i Public 360 eller ikke.`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'VIKTIG: Privatperson med adressesperre i 360, men ikke i Infotorg',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, but not in FREG. Updated only ssn on PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`], context)
      }
    } else {
      // Oppdater personen
      const updatedPrivatePerson = await callArchiveTemplate({ system: 'archive', template: 'update-private-person', parameter: { ...personData, recno: flow.oldPrivatePersonRes[0].Recno } }, context) // Returns recno of updated privatePerson
      if (!isNaN(updatedPrivatePerson)) {
        person.recno = updatedPrivatePerson
        person.updated = true
        person.updatedSsn = true
      } else {
        throw new HTTPError(500, 'Archive did not return recno and not error, what?')
      }
      if (flow.hasFregAddressProtection) {
        // Send mail til 360 administrator om at det er oppdatert en kontakt som har addressebeskyttelse i FREG. De kan sjekke at alt er på stell
        const mailStrBlock = `Arkiveringsroboten har oppdatert en privatperson med adressebeskyttelse i FREG.<br><br>Privatperson det gjelder har <strong>Recno: ${updatedPrivatePerson}</strong><br><br>Det bør undersøkes om personen er satt riktig i forhold til deres rutiner.`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'TIL INFO: Privatperson med adressebsekyttelse i FREG',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, and address protection in FREG. Updated PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`], context)
      }
    }
  } else if (!flow.hasOldPrivatePerson && flow.hasPrivatePerson) { // Har enten ikke nytt fnr, eller har kun en privatperson på det nye fnr, trenger bare en oppdatering av privatperson
    if (flow.hasP360AddressBlock) { // Special case, no address block in FREG, but address block in P360
      // Skreller vekk reell adresse fra person
      person.streetAddress = flow.privatePersonRes[0].PrivateAddress.StreetAddress
      person.zipCode = flow.privatePersonRes[0].PrivateAddress.ZipCode
      person.zipPlace = flow.privatePersonRes[0].PrivateAddress.ZipPlace
      person.recno = flow.privatePersonRes[0].Recno

      if (flow.hasFregAddressProtection) {
        // Send mail til 360 administrator om at det er funnet en kontakt som har adressesperring i 360 og addressebeskyttelse i FREG. Har kun oppdatert fødselsnummer på kontakten, men de bør sjekke at alt er på stell
        const mailStrBlock = `Arkiveringsroboten har funnet en privatperson med adressesperring i Public 360, og adressebeskyttelse i FREG.<br><br>Privatperson det gjelder har <strong>Recno: ${flow.privatePersonRes[0].Recno}</strong><br><br>Det bør undersøkes om alt er satt korrekt i forhold til deres rutiner.`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'TIL INFO: Privatperson med adressesperre i 360, og adressebsekyttelse i FREG',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, and address protection in FREG. Did not update PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`], context)
      } else {
        // Send mail til 360 administrator om at det er funnet en kontakt som har adressesperring i 360 men ikke i FREG. Har ikke oppdatert noe på kontakten, men de bør sjekke opp om personen skal ha adressesperre eller ikke - sjekke at alt er på stell
        const mailStrBlock = `Arkiveringsroboten har funnet en privatperson med adressesperring i Public 360, men som ikke har adressesperre i FREG.<br><br>Privatperson det gjelder har <strong>Recno: ${flow.privatePersonRes[0].Recno}</strong><br><br>Det bør undersøkes om personen skal ha adressesperre i Public 360 eller ikke.`
        await sendmail({
          to: toArchiveAdministrator,
          subject: 'VIKTIG: Privatperson med adressesperre i 360, men ikke i Infotorg',
          body: mailStrBlock
        })
        logger('info', ['syncPrivatePerson', `Found address block on privatePerson in P360, but not in FREG. Did not update PrivatePerson with "Recno: ${person.recno}", but sent mail to address block-contact`], context)
      }
    } else {
      if (!comparePrivatePersonToFreg(personData, flow.privatePersonRes[0])) {
        const updatedPrivatePerson = await callArchiveTemplate({ system: 'archive', template: 'update-private-person', parameter: { ...personData, recno: flow.privatePersonRes[0].Recno } }, context) // Returns recno of updated privatePerson
        if (!isNaN(updatedPrivatePerson)) {
          person.recno = updatedPrivatePerson
          person.updated = true
        } else {
          throw new HTTPError(500, 'Archive did not return recno and not error, what?')
        }
        if (flow.hasFregAddressProtection) {
          // Send mail til 360 administrator om at det er oppdatert en kontakt som har adressesperring i 360 og addressebeskyttelse i FREG. Har kun oppdatert fødselsnummer på kontakten, men de bør sjekke at alt er på stell
          const mailStrBlock = `Arkiveringsroboten har oppdatert en privatperson med adressebeskyttelse i FREG.<br><br>Privatperson det gjelder har <strong>Recno: ${flow.privatePersonRes[0].Recno}</strong><br><br>Det bør undersøkes om alt er satt korrekt i forhold til deres rutiner.`
          await sendmail({
            to: toArchiveAdministrator,
            subject: 'TIL INFO: Privatperson med adressebsekyttelse i FREG',
            body: mailStrBlock
          })
          logger('info', ['syncPrivatePerson', `Found address protection on privatePerson in FREG. Updated PrivatePerson with "Recno: ${person.recno}" and sent mail to address block-contact`], context)
        }
      } else {
        logger('info', ['syncPrivatePerson', 'Found privatePerson, but there was no difference between FREG person and P360 PrivatePerson. No need to update :)'], context)
        person.recno = flow.privatePersonRes[0].Recno
      }
    }
  } else {
    // Fant privatperson på både gammelt og nytt fnr... Her må det ryddes
    const mailStrBlock = `Arkiveringsroboten har funnet to privatpersoner i Public 360, men det er egentlig bare en privatperson som har byttet fødselsnummer. Roboten trenger hjelp til å rydde opp i dette, for den vet ikke hvordan :(<br> Dokumenter og saker der privatpersonene er sakspart bør sikkert også sjekkes.<br><br>Personene det gjelder er <strong>Recno: ${flow.privatePersonRes[0].Recno}</strong> (nytt fnr) og <strong>Recno: ${flow.oldPrivatePersonRes[0].Recno}</strong> (gammelt fnr)`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Funnet to privatpersoner etter fødselsnummerbytte',
      body: mailStrBlock
    })
    logger('error', ['syncPrivatePerson', `Found privatePerson on both found old social security number: ${oldSsn}, and new social security number: ${ssn}, send to arkivarer for handling`], context)
  }

  return person
}
