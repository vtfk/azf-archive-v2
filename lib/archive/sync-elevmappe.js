const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchive } } = require('../../config')
const HTTPError = require('../http-error')
const callArchiveTemplate = require('../call-archive-template')

const syncElevmappe = async (privatePerson, context) => {
  const { ssn, firstName, lastName, streetAddress, recno, updated } = privatePerson
  if (!ssn) {
    logger('error', ['Missing required parameter "privatePerson.ssn"'], context)
    throw new HTTPError(400, 'Missing required parameter "privatePerson.ssn"')
  }
  if (!firstName) {
    logger('error', ['Missing required parameter "privatePerson.firstName"'], context)
    throw new HTTPError(400, 'Missing required parameter "privatePerson.firstName"')
  }
  if (!lastName) {
    logger('error', ['Missing required parameter "privatePerson.lastName"'], context)
    throw new HTTPError(400, 'Missing required parameter "privatePerson.lastName"')
  }

  // First, check if elevmappe already exists
  const elevmappe = await callArchiveTemplate({ system: 'elevmappe', template: 'get-elevmappe', parameter: { ssn } }, context)
  const elevmappeRes = elevmappe.filter(mappe => mappe?.Status && mappe.Status !== 'Utgår') // Returns an array of Case-objects where status isn't "Utgår"

  if (elevmappeRes.length >= 1 && elevmappeRes[0].CaseNumber) {
    // Found one elevmappe, update it
    if (elevmappeRes.length > 1) {
      let mailStr = 'Arkiveringsroboten har funnet flere elevmapper på samme elev, og trenger at det ryddes i disse for å arkivere automatisk.<br><br><strong>Elevmapper:</strong><ul>'
      const caseNumbers = elevmappeRes.map(mappe => {
        mailStr += `<li>${mappe.CaseNumber}</li>`
        return mappe.CaseNumber
      })
      mailStr += `</ul><br>Roboten ønsker seg <strong>${elevmappeRes[0].CaseNumber}</strong> som gjeldende elevmappe.<br><br>Roboten ordner resten selv når dette er ryddet opp.<br><br>Tusen takk!`
      logger('warn', [`Found several elevmapper on ssn ${ssn}`, caseNumbers], context)
      await sendmail({
        to: toArchive,
        subject: 'Flere elevmapper på en elev',
        body: mailStr
      }, context)
    }
    const needsUpdate = (updated || (elevmappeRes[0].Title !== 'Elevmappe') || (elevmappeRes[0].UnofficialTitle !== `Elevmappe - ${firstName} ${lastName}`) || (elevmappeRes[0].Contacts[0].Address.StreetAddress !== streetAddress))

    if (needsUpdate) { // PrivatePerson was updated or elevmappe was not correct, update elevmappe as well
      logger('info', ['syncElevmappe', `Elevmappe "${elevmappeRes[0].CaseNumber}" metadata is different from person info (name, ssn, streetAddress), or has wrong case-metadata (title, unofficialTitle)), will update to match person info and case-metadata`], context)
      return await callArchiveTemplate({ system: 'elevmappe', template: 'update-elevmappe', parameter: { firstName, lastName, recno, caseNumber: elevmappeRes[0].CaseNumber } }, context)
    } else { // PrivatePerson was not updated, don't need to update elevmappe
      logger('info', ['syncElevmappe', `PrivatePerson was not updated, and elevmappe-metadata on case "${elevmappeRes[0].CaseNumber}" was correct, no need to update elevmappe`], context)
      return { Recno: elevmappeRes[0].Recno, CaseNumber: elevmappeRes[0].CaseNumber }
    }
  } else if (elevmappeRes.length === 0) {
    // No elevmappe found - create one
    logger('info', ['syncElevmappe', 'No elevmappe her gitt, will create'], context)
    return await callArchiveTemplate({ system: 'elevmappe', template: 'create-elevmappe', parameter: { firstName, lastName, ssn, recno } }, context)
  } else {
    // Hit kommer vi egt aldri altså
    logger('error', ['syncElevmappe', `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`])
    throw new HTTPError(500, `Several elevmapper found on social security number: ${ssn}, send to arkivarer for handling`)
  }
}

module.exports = { syncElevmappe }
