const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchiveAdministrator } } = require('../../config')
const callArchiveTemplate = require('../call-archive-template')

module.exports = async (sharePointData, context) => {
  const { siteUrl, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph, caseType } = sharePointData
  const result = {}
  const status = {
    project: false,
    case: false
  }

  // PROJECT
  if ((projectNumber && projectNumber.toLowerCase() === 'nei') || !projectNumber) {
    // project does not exists. Need to create
    logger('info', ['syncSharePointSite', 'createProject'], context)
    const createProject = await callArchiveTemplate({ system: 'sharepoint', template: 'create-project', parameter: { siteUrl, projectTitle, responsiblePersonEmail } }, context) // Returns projectNumber from 360
    result.projectNumber = createProject.ProjectNumber
    result.responsiblePersonEmail = responsiblePersonEmail
    status.project = 'successfully created'
    logger('info', ['syncSharePointSite', `Project created. Project number: ${result.projectNumber}`], context)
  } else { // contains project number. External ID cannot be updated. Only responisblePerson and Title.
    logger('info', ['syncSharePointSite', `project already exists. Project number: ${projectNumber}`], context)
    const getProject = await callArchiveTemplate({ system: 'archive', template: 'get-project', parameter: { projectNumber } }, context) // Returns projectNumber from 360
    if (!getProject.ProjectNumber) throw new Error(`Project "${projectNumber}" does not exist.`)
    result.projectNumber = getProject.ProjectNumber
    result.responsiblePersonEmail = getProject.ResponsiblePerson.Email
    status.project = 'found'
    logger('info', `Found project. Projectnumber: ${result.projectNumber}`)
  }
  result.projectName = projectTitle

  // CASE
  const getCase = await callArchiveTemplate({ system: 'sharepoint', template: 'get-case', parameter: { caseExternalId } }, context)
  if (getCase?.CaseNumber) { // If we found a case
    // do not update case if exists
    if (getCase.Status === 'Utgår') {
      // Send mail til 360 administrator om at dette er en sharepoint sak som er satt til utgår...
      const mailStrBlock = `Arkiveringsroboten fant en SharePoint-sak som var satt til Utgår i Public 360.<br>Kan dere sette den til riktig status? Roboten vil legge til et dokument i saken, sannsynligvis lenge før du leser denne eposten.... :-)  <br><br>Saken det gjelder har <strong>Saksnummer: ${getCase.CaseNumber}</strong>`
      await sendmail({
        to: toArchiveAdministrator,
        subject: 'Oppdaget SharePoint-sak med status Utgår',
        body: mailStrBlock
      }, context)
      logger('warn', ['syncSharePointSite', `Found case in P360 but status is Utgår. Will use the case anyway. Case number: ${getCase.CaseNumber}. Sent mail to archive administrators`], context)
    }
    logger('info', ['syncSharePointSite', `Case already exists. Case number: ${getCase.CaseNumber}`], context)
    result.caseNumber = getCase.CaseNumber
    result.caseTitle = getCase.Title
    status.case = 'found'
  } else {
    const template = caseType ? `create-case-${caseType}` : 'create-case'
    logger('info', ['syncSharePointSite', 'createCase', `using template: ${template}`], context)
    const createCase = await callArchiveTemplate({ system: 'sharepoint', template, parameter: { caseTitle, projectNumber: result.projectNumber, caseExternalId, accessGroup, paragraph, responsiblePersonEmail: result.responsiblePersonEmail } }, context) // Returns caseNumber from 360
    result.caseNumber = createCase.CaseNumber
    result.caseTitle = caseTitle
    status.case = 'successfully created'
    logger('info', ['syncSharePointSite', `Case created. Case number: ${result.caseNumber}`], context)
  }

  // Set result.msg with status
  result.msg = `Project ${status.project}. Case ${status.case}`

  return result
}
