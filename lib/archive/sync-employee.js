const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator }, DEV_SYNCEMPLOYEE_MANAGER } = require('../../config')
const HTTPError = require('../http-error')
const callArchive = require('../call-archive')

const repackManager = (archiveManager) => {
  if (!archiveManager.Recno) throw new Error('archiveManager ContactPerson does not have Recno - something is very wrong...')
  const firstName = archiveManager.MiddleName && archiveManager.MiddleName.length > 1 ? `${archiveManager.FirstName} ${archiveManager.MiddleName}` : archiveManager.FirstName
  const repacked = {
    recno: archiveManager.Recno,
    email: archiveManager.Email,
    name: `${firstName} ${archiveManager.LastName}`
  }
  return repacked
}

const repackEnterprise = (responsibleEnterprise) => {
  if (!responsibleEnterprise.Recno) throw new Error('ResponsibleEnterprise does not have Recno - something is very wrong...')
  const repacked = {
    recno: responsibleEnterprise.Recno,
    externalId: responsibleEnterprise.ExternalID,
    shortName: responsibleEnterprise.Initials,
    name: responsibleEnterprise.Name
  }
  return repacked
}

const syncEmployee = async (privatePerson, fintfolkEmployee, manualManagerEmail, context) => {
  const { ssn } = privatePerson
  if (!ssn) {
    logger('error', ['Missing required parameter "privatePerson.ssn"'], context)
    throw new HTTPError(400, 'Missing required parameter "privatePerson.ssn"')
  }

  // Need to get p360 enterprise and leaderEmail
  // Find unit and index / level for narmesteleder

  // First find mainposition or first active position
  let mainPosition = fintfolkEmployee.arbeidsforhold.find(forhold => (forhold.aktiv && forhold.hovedstilling))
  if (!mainPosition) mainPosition = fintfolkEmployee.arbeidsforhold.find(forhold => forhold.aktiv && forhold.lonnsprosent > 0) // First one aktiv and with some lonn
  if (!mainPosition) mainPosition = fintfolkEmployee.arbeidsforhold.find(forhold => forhold.aktiv) // Aktiv at least..
  if (!mainPosition) {
    throw new HTTPError(500, `No valid arbeidsforhold found for employee ${fintfolkEmployee.ansattnummer}. Cannot continue`)
  }

  let responsibleEnterprise
  let archiveManager
  let mainResponsibleUnit
  let level = mainPosition.strukturlinje.length
  let movedUp = false
  for (const unit of mainPosition.strukturlinje) {
    // Check if unit has a leader in FINT
    if (!unit.leder || !unit.leder.ansattnummer) {
      logger('warn', [`No manager found in FINT for unit ${unit.kortnavn || unit.navn}, going up one level`], context)
      level--
      movedUp = true
      continue
    }
    // If we are in p360 test - leaders usually don't have user, so we override if we need to
    if (DEV_SYNCEMPLOYEE_MANAGER) {
      logger('info', ['DEV_SYNCEMPLOYEE_MANAGER is set in local.settings - will override manager kontaktEpostadresse with value from local.settings'], context)
      unit.leder.kontaktEpostadresse = DEV_SYNCEMPLOYEE_MANAGER
    }
    // If we have unit with leader, check if leader is leader in first one
    if (unit.leder.ansattnummer === fintfolkEmployee.ansattnummer) {
      level-- // We move up one level, but not set movedUp to true - vi kan jo ikke velge en enhet der ansatt også er leder lisssom
      continue
    }
    if (movedUp && level < 3) { // If we have moved from original unit, and are above seksjon, we won't go further, seksjon should be in archive (1=FK, 2=FD, 3=SEKTOR, 4=SEKSJON, 5=TEAM)
      break
    }
    if (!mainResponsibleUnit) mainResponsibleUnit = unit
    // Get enterprise from archive
    let enterpriseMatch = false
    let enterpriseMatches = await callArchive({ service: 'ContactService', method: 'GetEnterprises', parameter: { ExternalID: unit.organisasjonsKode, Active: true, Categories: ['Intern'] } }, context)
    if (enterpriseMatches.length === 1) {
      logger('info', [`Found match for enterprise with ExternalID ${unit.organisasjonsKode}`], context)
      enterpriseMatch = true
    }
    if (!enterpriseMatch && unit.kortnavn) { // If not found, trying with shortcode
      logger('info', [`No unique match for enterprise with ExternalID ${unit.organisasjonsKode}, trying with shortcode`], context)
      enterpriseMatches = await callArchive({ service: 'ContactService', method: 'GetEnterprises', parameter: { Initials: unit.kortnavn, Active: true, Categories: ['Intern'] } }, context)
      if (enterpriseMatches.length === 1) {
        logger('info', [`Found match for enterprise with shortcode ${unit.kortnavn}`], context)
        enterpriseMatch = true
      }
    }
    if (!enterpriseMatch) {
      logger('info', [`Could not find enterpriseMatch for unit ${unit.kortnavn || unit.navn}, trying one level up`], context)
      level-- // we move up in the structure
      movedUp = true
      continue
    }
    // Here we have enterpriseMatch and we can try to find manager as well
    let managerMatch = false
    const managerMatches = await callArchive({ service: 'ContactService', method: 'GetContactPersons', parameter: { email: unit.leder.kontaktEpostadresse, Active: true, Categories: ['Intern'] } })
    if (managerMatches.length === 1) {
      logger('info', [`Found ContactPerson for manager (ansattnummer) ${unit.leder.ansattnummer} in unit ${unit.kortnavn || unit.navn} - great success`], context)
      managerMatch = true
    }
    if (enterpriseMatch && managerMatch) {
      logger('info', [`Wihoo found both enterprise and manager in archive for unit ${unit.kortnavn || unit.navn} - great success`], context)
      responsibleEnterprise = enterpriseMatches[0]
      archiveManager = managerMatches[0]
      break
    }
    logger('info', [`Could not find manager in P360 for unit ${unit.kortnavn || unit.navn}, trying one level up`], context)
    level-- // we move up in the structure
    movedUp = true
  }

  if (!responsibleEnterprise || !archiveManager) {
    throw new Error(`Could not find manager and responsibleEnterprise for employee ${fintfolkEmployee.kontaktEpostadresse}`)
  }

  responsibleEnterprise = repackEnterprise(responsibleEnterprise)
  archiveManager = repackManager(archiveManager)

  if (movedUp) {
    // Send e-post til arkivet om at vi måtte bevege oss et steg opp
    const mailBody = `
Hei!<br><br>Arkiveringsroboten fant ikke match i P360 på virksomhet og leder for ansatt (privatperson) med recno: <strong>${privatePerson.recno}</strong>.
<br>
<i>Merk at roboten kan ha funnet korrekt intern virksomhet i P360, men ikke funnet lederen som kontaktperson i P360, så om virksomheten ser ok ut, mangler det nok kontaktperson for lederen (eller feil e-postadresse på kontaktpersonen)</i>
<br>
<br>
Enhet der ansatt jobber: <strong>${mainResponsibleUnit.navn} (${mainResponsibleUnit.kortnavn || 'mangler kortnavn'})</strong> (fra HR)
<br>
Nærmeste leder for ansatt: <strong>${mainResponsibleUnit.leder.kontaktEpostadresse}</strong> (fra HR)
<br>
<br>
Siden vi ikke fant virksomhet/leder i P360 gikk roboten <strong>${mainPosition.strukturlinje.length - level}</strong> nivå opp i organisasjonsstrukturen, for der fant den match i P360 👍
<br>
Virksomhet som roboten brukte som ansvarlig (recno i parentes): <strong>${responsibleEnterprise.name} (${responsibleEnterprise.recno})</strong> (fra P360)
<br>
Leder (intern kontaktperson) som roboten brukte som ansvarlig (recno i parentes): <strong>${archiveManager.email} (${archiveManager.recno})</strong>
<br>
<br>
Kan dere sjekke om dette er korrekt, evt fikse slik at det blir riktig? (Sjekk gjerne om det er saker / dokumenter som må rettes opp på ansatt med recno <strong>${privatePerson.recno}</strong>)
<br>
<br>
Ha en fortyllende dag 🪄
`
    await sendmail({
      to: toArchiveAdministrator,
      subject: 'Arkiveringsroboten klarte ikke finne korrekt leder / virksomhet for ansatt',
      body: mailBody
    }, context)
  }

  return { responsibleEnterprise, archiveManager }
}

module.exports = { syncEmployee }
