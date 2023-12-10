const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator } } = require('../../config')
const callArchiveTemplate = require('../call-archive-template')
const HTTPError = require('../http-error')
const { fregNameBirthdate, fregSsn } = require('../freg')
const { handleFakeSsn } = require('../handle-fake-ssn')

const privatePersonIsUpToDate = (privatePersonToUpdate, privatePersonData) => {
  if (!privatePersonToUpdate.PrivateAddress) return false
  if (privatePersonData.streetAddress.toLowerCase() !== privatePersonToUpdate.PrivateAddress.StreetAddress.toLowerCase()) return false
  if (privatePersonData.zipCode !== privatePersonToUpdate.PrivateAddress.ZipCode) return false
  if (privatePersonData.zipPlace !== privatePersonToUpdate.PrivateAddress.ZipPlace) return false
  if (privatePersonData.firstName !== privatePersonToUpdate.FirstName) return false
  if (privatePersonData.lastName !== privatePersonToUpdate.LastName) return false
  return true
}

const getFirstAndLastName = (name) => {
  const nameList = name.split(' ')
  if (nameList.length < 2) throw new HTTPError(400, 'Name must have at least one whitespace in it...')
  const firstName = name.substring(0, name.lastIndexOf(' '))
  const lastName = nameList[nameList.length - 1]
  return { firstName, lastName }
}

const getNameFromFirstAndLastName = (firstName, lastName) => {
  if (!firstName || !lastName) throw new HTTPError(400, 'Missing required parameter. "firstName" and "lastName" are required')
  return `${firstName} ${lastName}`
}

const getName = (name, firstName, lastName) => {
  if (name) {
    const { firstName, lastName } = getFirstAndLastName(name)
    return { firstName, lastName, fullName: name }
  } else if (firstName && lastName) {
    const fullName = getNameFromFirstAndLastName(firstName, lastName)
    return { firstName, lastName, fullName }
  } else {
    return { firstName: undefined, lastName: undefined, fullName: undefined }
  }
}

const getSyncPrivatePersonMethod = (syncPrivatePersonData) => {
  const { ssn, name, birthdate, fakeSsn } = syncPrivatePersonData
  if (birthdate) {
    if (typeof birthdate !== 'string') throw new HTTPError(400, 'birthdate must be string')
    const birthdateList = birthdate.split('-')
    if (birthdateList.length !== 3) throw new HTTPError(400, 'birthdate must be on format YYYY-MM-DD')
    if (birthdateList[0].length !== 4 || birthdateList[1].length !== 2 || birthdateList[2].length !== 2) if (birthdateList.length !== 3) throw new HTTPError(400, 'birthdate must be on format YYYY-MM-DD')
  }
  if (fakeSsn) {
    if (typeof fakeSsn !== 'boolean') throw new HTTPError(400, 'Parameter "fakeSsn" must be of type boolean - the fake ssn is generated based on birthdate and gender')
    return 'fakessn'
  }
  if (ssn) return 'ssn'
  if (name && birthdate) return 'namebirthdate'
  throw new HTTPError(400, 'SyncPrivatePerson requires one of these parameter combinations: ("fakeSsn"), ("ssn"), or ("name" and "birthdate")')
}

const repackFregAddress = (fregData) => {
  const addressProtection = fregData.adressebeskyttelse.some(ele => ['strengtFortrolig', 'fortrolig'].includes(ele))
  const addressBlock = ['klientadresse', 'fortrolig'].includes(fregData.postadresse.adressegradering)
  return {
    address: {
      streetAddress: addressBlock ? `Sperret adresse (${fregData.postadresse.adressegradering})` : fregData.postadresse.gateadresse,
      zipCode: fregData.postadresse.postnummer,
      zipPlace: fregData.postadresse.poststed
    },
    addressProtection: addressProtection || addressBlock
  }
}

const syncPrivatePerson = async (syncPrivatePersonData, context) => {
  const { ssn, name, birthdate, fakeSsn, gender, streetAddress, zipCode, zipPlace, forceUpdate, manualData } = syncPrivatePersonData

  const syncPrivatePersonMethod = getSyncPrivatePersonMethod(syncPrivatePersonData)

  // Verify some parameters
  if (fakeSsn || manualData) {
    if (!name || !streetAddress || !zipCode || !zipPlace) throw new HTTPError(400, 'When using fakeSsn or manualData, parameters "name", "streetAddress", "zipCode" and "zipPlace" are required')
  }

  // If we use birthdate and name - we already have fregData, so we cache it in case we need it
  let fregCache = null

  let privatePersonRes = null

  /**
   * @type {string} depending on the identifier for the person - ssnToUse is the resulting ssn, which we will use to create or update the privatePerson
   */
  let ssnToUse = null
  if (syncPrivatePersonMethod === 'ssn') {
    // If we use ssn as identifier
    if (!ssn) throw new HTTPError(400, 'Missing required parameter "ssn"')
    if (typeof ssn !== 'string' || ssn.length !== 11) throw new HTTPError(400, 'Parameter "ssn" must be string of length 11')
    logger('info', ['Identifier is "ssn" checking for PrivatePerson with provided ssn'], context)
    privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn } }, context)
    ssnToUse = ssn
  } else if (syncPrivatePersonMethod === 'namebirthdate') {
    // If we use name and birthdate as identifier
    if (!name) throw new HTTPError(400, 'Missing required parameter "name"')
    if (!birthdate) throw new HTTPError(400, 'Missing required parameter "birthdate"')
    logger('info', ['Identifier is "name and birthdate" fetching ssn from freg with provided name and birthdate'], context)
    const fregData = await fregNameBirthdate(name, birthdate) // If not found is handled by throw error inside the function
    fregCache = fregData
    logger('info', ['Identifier is "name and birthdate" found ssn from freg, will use ssn found in freg as identifier for PrivatePErson'], context)
    privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn: fregData.foedselsEllerDNummer } }, context)
    ssnToUse = fregData.foedselsEllerDNummer
  } else if (syncPrivatePersonMethod === 'fakessn') {
    // If we use fake ssn as identifier
    if (!birthdate) throw new HTTPError(400, 'Missing required parameter "birthdate"')
    if (!name) throw new HTTPError(400, 'Missing required parameter "name"')
    if (!gender) throw new HTTPError(400, 'Missing required parameter "gender"')
    logger('info', ['Identifier is "fakeSsn" running handleFakeSsn with provided name, birthdate and gender'], context)
    const { resultFakeSsn, privatePersonResult } = await handleFakeSsn(birthdate, gender, name, context)
    privatePersonRes = privatePersonResult || await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn: fakeSsn } }, context)
    ssnToUse = resultFakeSsn
  } else {
    throw new HTTPError(500, 'Hit kommer vi aldri... (men vi gjør sikkert det...)')
  }

  // alright, alrigth, alright - now we have a privatepersonresult, and ssn for all cases, beautiful!
  if (!ssnToUse) throw new HTTPError(500, 'No ssn to use, something is wrong in the code... contact API responsible')

  // This is the object we are going to return - see how it behaves in each of the cases below (should we add age as well?)
  const privatePerson = {
    ssn: ssnToUse,
    name: null,
    firstName: null,
    lastName: null,
    streetAddress: null,
    zipCode: null,
    zipPlace: null,
    addressProtection: null,
    recno: null,
    updated: null,
    created: null
  }

  if (privatePersonRes.length === 0) { // No match - need to create
    logger('info', ['No matches on identifier data, creating new PrivatePerson'], context)
    if (manualData || fakeSsn) { // CREATE with manual data
      const { firstName, lastName } = getFirstAndLastName(name)
      const privatePersonData = {
        firstName,
        lastName,
        ssn: ssnToUse,
        streetAddress,
        zipCode,
        zipPlace
      }
      const createPrivatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'create-private-person', parameter: privatePersonData }, context)
      privatePerson.name = name
      privatePerson.firstName = firstName
      privatePerson.lastName = lastName
      privatePerson.streetAddress = streetAddress
      privatePerson.zipCode = privatePersonData.zipCode
      privatePerson.zipPlace = privatePersonData.zipPlace
      privatePerson.addressProtection = false
      privatePerson.recno = createPrivatePersonRes
      privatePerson.updated = false
      privatePerson.created = true
    } else { // Not manual or fakeSsn
      // CREATE privateperson with freg data
      const fregData = fregCache || await fregSsn(ssnToUse) // If not found is handled by throw error inside the function

      const { addressProtection, address } = repackFregAddress(fregData)

      const privatePersonData = {
        firstName: fregData.fornavn,
        lastName: fregData.etternavn,
        ssn: ssnToUse,
        streetAddress: address.streetAddress,
        zipCode: address.zipCode,
        zipPlace: address.zipPlace
      }
      const createPrivatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'create-private-person', parameter: privatePersonData }, context)
      privatePerson.name = name
      privatePerson.firstName = fregData.fornavn
      privatePerson.lastName = fregData.etternavn
      privatePerson.streetAddress = address.streetAddress
      privatePerson.zipCode = address.zipCode
      privatePerson.zipPlace = address.zipPlace
      privatePerson.addressProtection = addressProtection
      privatePerson.recno = createPrivatePersonRes
      privatePerson.updated = false
      privatePerson.created = true
    }
    logger('info', [`Successfully created PrivatePerson wth recno ${privatePerson.recno}`], context)
  } else {
    logger('info', [`Found ${privatePersonRes.length} match(es) on identifier data`], context)
    if (privatePersonRes.length > 1) { // One or more matches - check if there are too many
      // Send e-post til arkivet om at det er flere aktive privatpersoner på samme fnr
      const mailStrBlock = `Hallois, hallois!<br><br>Arkiveringsroboten har funnet flere privatpersoner i Public 360 med samme fødselsnummer, og trenger hjelp til å rydde opp i dette, for den vet ikke hvordan :( <br> Dokumenter og saker der privatpersonene er sakspart bør sikkert også sjekkes.<br><br>Fødselsnummeret det gjelder er <strong>${ssnToUse}</strong><br><br>Takker og bukker 😁`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Jeg har funnet flere privatpersoner med samme fødselsnummer',
        body: mailStrBlock
      }, context)
      logger('warn', ['syncPrivatePerson', `Found several privatePerson on the same social security number: ${ssnToUse}, sent mail to arkivarer for handling`], context)
    }
    const foundPrivatePerson = privatePersonRes[0] // take the first one
    if (forceUpdate) { // Her skal det oppdateres samma hva!
      logger('info', [`ForceUpdate is true, updating data on privatePerson with recno: ${foundPrivatePerson.Recno}`], context)
      if (manualData || fakeSsn) { // UPDATE privateperson with manual data
        const { firstName, lastName } = getFirstAndLastName(name)
        const privatePersonData = {
          recno: foundPrivatePerson.Recno,
          firstName,
          lastName,
          streetAddress,
          zipCode,
          zipPlace
        }
        let updatePrivatePersonRes = null
        if (privatePersonIsUpToDate(foundPrivatePerson, privatePersonData)) {
          logger('info', [`PrivatePerson with recno: ${foundPrivatePerson.Recno} is already up to date, no need to update`], context)
          updatePrivatePersonRes = foundPrivatePerson.Recno
        } else {
          updatePrivatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'update-private-person', parameter: privatePersonData }, context) // Returns recno of updated privatePerson
        }
        privatePerson.name = name
        privatePerson.firstName = firstName
        privatePerson.lastName = lastName
        privatePerson.streetAddress = streetAddress
        privatePerson.zipCode = privatePersonData.zipCode
        privatePerson.zipPlace = privatePersonData.zipPlace
        privatePerson.addressProtection = false
        privatePerson.recno = updatePrivatePersonRes
        privatePerson.updated = true
        privatePerson.created = false
      } else { // Kjører FREG oppdatering
        // UPDATE privateperson with freg data
        const fregData = fregCache || await fregSsn(ssnToUse) // If not found is handled by throw error inside the function

        const { addressProtection, address } = repackFregAddress(fregData)

        const privatePersonData = {
          recno: foundPrivatePerson.Recno,
          firstName: fregData.fornavn,
          lastName: fregData.etternavn,
          streetAddress: address.streetAddress,
          zipCode: address.zipCode,
          zipPlace: address.zipPlace
        }
        let updatePrivatePersonRes = null
        if (privatePersonIsUpToDate(foundPrivatePerson, privatePersonData)) {
          logger('info', [`PrivatePerson with recno: ${foundPrivatePerson.Recno} is already up to date, no need to update`], context)
          updatePrivatePersonRes = foundPrivatePerson.Recno
        } else {
          updatePrivatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'update-private-person', parameter: privatePersonData }, context) // Returns recno of updated privatePerson
        }
        privatePerson.name = name
        privatePerson.firstName = fregData.fornavn
        privatePerson.lastName = fregData.etternavn
        privatePerson.streetAddress = address.streetAddress
        privatePerson.zipCode = address.zipCode
        privatePerson.zipPlace = address.zipPlace
        privatePerson.addressProtection = addressProtection
        privatePerson.recno = updatePrivatePersonRes
        privatePerson.updated = true
        privatePerson.created = false
      }
      logger('info', [`Successfully updated data on privatePerson with recno: ${foundPrivatePerson.Recno}`], context)
    } else { // Vi trenger ikke oppdatere, kan bare returnere luringen
      const addressProtection = foundPrivatePerson.PrivateAddress.StreetAddress && foundPrivatePerson.PrivateAddress.StreetAddress.toLowerCase().includes('sperret')
      privatePerson.name = `${foundPrivatePerson.FirstName} ${foundPrivatePerson.LastName}`
      privatePerson.firstName = foundPrivatePerson.FirstName
      privatePerson.lastName = foundPrivatePerson.LastName
      privatePerson.streetAddress = foundPrivatePerson.PrivateAddress.StreetAddress
      privatePerson.zipCode = foundPrivatePerson.PrivateAddress.ZipCode
      privatePerson.zipPlace = foundPrivatePerson.PrivateAddress.ZipPlace
      privatePerson.addressProtection = addressProtection
      privatePerson.recno = foundPrivatePerson.Recno
      privatePerson.updated = false
      privatePerson.created = false
    }
  }

  // Check if we should email archive about address protection
  if (privatePerson.addressProtection) {
    // Send e-post til arkivet om at det er flere aktive privatpersoner på samme fnr
    const mailStrBlock = `Hallois, hallois!<br><br>Arkiveringsroboten har håndtert en privatperson i Public 360 med adressebeskyttelse (klientadresse, fortrolig, eller strengtFortrolig), og sier i fra til dere, slik at dere kan sjekke at alt er på stell om dere ønsker.<br><br>Privatpersonen har recno <strong>${privatePerson.recno}</strong><br><br>Ha en strålende dag! 😁`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Håndtert en privatperson med adressebeskyttelse',
      body: mailStrBlock
    }, context)
    logger('warn', ['syncPrivatePerson', 'Handled privatePerson with addressProtection, recno: ', privatePerson.recno], context)
  }

  // Do a simple check that no values are null, to make sure the api works
  for (const [key, value] of Object.entries(privatePerson)) {
    if (value === null) throw new HTTPError(500, `Oh no, ${key} has null value, developer has made a mistake, tell you know who to fix it...`, privatePerson)
  }

  // Then return the privatePerson
  return privatePerson
}

module.exports = { syncPrivatePerson, repackFregAddress, getSyncPrivatePersonMethod, getName }
