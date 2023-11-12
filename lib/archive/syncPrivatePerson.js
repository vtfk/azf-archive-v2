const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator } } = require('../../config')
const callArchiveTemplate = require('../call-archive-template')
const HTTPError = require('../http-error')
const { fregNameBirthdate, fregSsn } = require('../freg')
const handleFakeSsn = require('../handle-fake-ssn')

const comparePrivatePersonToFreg = (fregPerson, privatePerson) => {
  if (!privatePerson.PrivateAddress) return false
  if (fregPerson.streetAddress.toLowerCase() !== privatePerson.PrivateAddress.StreetAddress.toLowerCase()) return false
  if (fregPerson.zipCode !== privatePerson.PrivateAddress.ZipCode) return false
  if (fregPerson.zipPlace !== privatePerson.PrivateAddress.ZipPlace) return false
  if (fregPerson.firstName !== privatePerson.FirstName) return false
  if (fregPerson.lastName !== privatePerson.LastName) return false
  return true
}

const getFirstAndLastName = (name) => {
  const nameList = name.split(' ')
  if (nameList.length < 2) throw new HTTPError(400, 'Name must have at least one whitespace in it...')
  const firstName = name.substring(0, name.lastIndexOf(' '))
  const lastName = nameList[nameList.length - 1]
  return { firstName, lastName }
}

const getSyncPrivatePersonMethod = (syncPrivatePersonData) => {
  const { ssn, name, birthdate, fakeSsn } = syncPrivatePersonData
  if (fakeSsn) {
    if (typeof fakeSsn !== 'boolean') throw new HTTPError(400, 'Parameter "fakeSsn" must be of type boolean - the fake ssn is generated based on birthdate and gender' )
    return 'fakeSsn'
  }
  if (ssn) return 'ssn'
  if (name && birthdate) return 'namebirthdate'
  throw new HTTPError(400, `SyncPrivatePerson requires one of these parameter combinations: ("fakeSsn"), ("ssn"), or ("name" and "birthdate")` )
}

const repackFregAddress = (fregData) => {
  const addressProtection = fregData.adressebeskyttelse.some(ele => ['strengtFortrolig', 'fortrolig'].includes(ele))
  const addressBlock = ['klientadresse', 'fortrolig'].includes(fregData.postadresse.adressegradering)
  return {
    address: {
      streetAddress: addressBlock ? `Sperret adresse (${fregData.postadresse.adressegradering})` : fregData.postadresse.gateadresse,
      zipCode: fregData.postadresse.postnummer,
      zipPlace: fregData.postadresse.poststed,
    },
    addressProtection: addressProtection || addressBlock
  }
}

// Create a common sperret adresse greie som fungerer for alle options ellerno?

// REMEMBER TO check for kanKontaktes - if true, should maybe send to arkivarer that should be manually checked

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
    privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn } }, context)
    ssnToUse = ssn
  } else if (syncPrivatePersonMethod === 'namebirthdate') {
    // If we use name and birthdate as identifier
    if (!name) throw new HTTPError(400, 'Missing required parameter "name"')
    if (!birthdate) throw new HTTPError(400, 'Missing required parameter "birthdate"')
    const fregData = await fregNameBirthdate(name, birthdate) // If not found is handled by throw error inside the function
    fregCache = fregData
    privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn: fregData.foedselsEllerDNummer } }, context)
    ssnToUse = fregData.foedselsEllerDNummer
  } else if (syncPrivatePersonMethod === 'fakessn') {
    // If we use fake ssn as identifier
    if (!birthdate) throw new HTTPError(400, 'Missing required parameter "birthdate"')
    if (!name) throw new HTTPError(400, 'Missing required parameter "name"')
    if (!gender) throw new HTTPError(400, 'Missing required parameter "gender"')
    const { fakeSsn, privatePersonResult } = await handleFakeSsn(birthdate, gender, name, context)
    privatePersonRes = privatePersonResult || await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn: fakeSsn } }, context)
    ssnToUse = fakeSsn
  } else {
    throw new HTTPError(500, 'Hit kommer vi aldri...')
  }

  // alright, alrigth, alright - now we have a privatepersonresult, and ssn for all cases, beautiful!
  if (!ssnToUse) throw new HTTPError('No ssn to use, something is wrong in the code... contact API responsible')

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
    created: null,
    canSendOnSvarUt: null
  }

  if (privatePersonRes.length === 0) {
    // No match - need to create
    logger('info', ['No mathces on identifier data, creating new PrivatePerson'], context)
    if (manualData || fakeSsn) {
      // CREATE with manual data, and return person
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
      privatePerson.zipCode = privatePerson.zipCode
      privatePerson.zipPlace = privatePerson.zipPlace
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
        lastName: fregData.fornavn,
        ssn: ssnToUse,
        streetAddress: address.streetAddress,
        zipCode: address.zipCode,
        zipPlace: address.zipPlace
      }
      const createPrivatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'create-private-person', parameter: privatePersonData }, context)
      privatePerson.name = name
      privatePerson.firstName = fregData.fornavn
      privatePerson.lastName = fregData.fornavn
      privatePerson.streetAddress = address.streetAddress
      privatePerson.zipCode = address.zipCode
      privatePerson.zipPlace = address.zipPlace
      privatePerson.addressProtection = addressProtection
      privatePerson.recno = createPrivatePersonRes
      privatePerson.updated = false
      privatePerson.created = true
    }

  } else {
    // One or more matches - check if there are too many
    if (privatePersonRes.length > 0) {
      // Send e-post til arkivet om at det er flere aktive privatpersoner på samme fnr
      const mailStrBlock = `Hallois, hallois!<br><br>Arkiveringsroboten har funnet flere privatpersoner i Public 360 med samme fødselsnummer, og trenger hjelp til å rydde opp i dette, for den vet ikke hvordan :( <br> Dokumenter og saker der privatpersonene er sakspart bør sikkert også sjekkes.<br><br>Fødselsnummeret det gjelder er <strong>${ssnToUse}</strong><br><br>Takker og bukker 😁`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Jeg har funnet flere privatpersoner med samme fødselsnummer',
        body: mailStrBlock
      })
      logger('error', ['syncPrivatePerson', `Found several privatePerson on the same social security number: ${ssnToUse}, send to arkivarer for handling`], context)
    }
    // Sjekk parameter om vi skal oppdatere, oppdater om vi skal, hvis ikke kan vi nok bare si at vi er fornøyd med personen (sjekk litt for adressesperring og sånt og forsåvidt) :)
    
    return 'hahah'
  }

  // Check if we should email archive about address protection
  // Then return the privatePerson

}

module.exports = { syncPrivatePerson, repackFregAddress, getSyncPrivatePersonMethod }
