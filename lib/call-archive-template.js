const callArchive = require('./call-archive')
const validateTemplateData = require('./validate-templatedata')
const { httpError } = require('./http-error')
const { logger } = require('@vtfk/logger')
const generatePdf = require('./generate-pdf')
const { GENERATED_PDF_PROPERTY_NAME } = require('../config')
const HTTPError = require('./http-error')

const addAttachments = (archivePayload, attachments) => {
  const validServices = ['DocumentService']
  const validMethods = ['CreateDocument', 'UpdateDocument']
  if (!validServices.includes(archivePayload.service)) throw new Error(`Adding attachment is only allowed in services: '${validServices.toString()}' this template is using service: '${archivePayload.service}'. Why are you doing this??`)
  if (!validMethods.includes(archivePayload.method)) throw new Error(`Adding attachment is only allowed in methods: '${validMethods.toString()}' this template is using method: '${archivePayload.method}'. Why are you doing this??`)

  for (const attachment of attachments) {
    if (!attachment.title) throw new Error('Missing required parameter in attachment object "attachment.title"')
    if (!attachment.format) throw new Error('Missing required parameter in attachment object "attachment.format"')
    if (!attachment.base64) throw new Error('Missing required parameter in attachment object "attachment.base64"')
    if (!archivePayload.parameter.Files) archivePayload.parameter.Files = []
    archivePayload.parameter.Files.push({
      Base64Data: attachment.base64,
      Format: attachment.format,
      Status: 'F',
      Title: attachment.title,
      VersionFormat: attachment.versionFormat || 'P'
    })
  }
  return archivePayload
}

const addContacts = (archivePayload, contacts) => {
  const validServices = ['DocumentService', 'CaseService', 'ProjectService']
  const validMethods = ['CreateDocument', 'UpdateDocument', 'CreateCase', 'UpdateCase', 'CreateProject', 'UpdateProject']
  if (!validServices.includes(archivePayload.service)) throw new Error(`Adding contacts is only allowed in services: '${validServices.toString()}' this template is using service: '${archivePayload.service}'. Why are you doing this?? :(`)
  if (!validMethods.includes(archivePayload.method)) throw new Error(`Adding contacts is only allowed in methods: '${validMethods.toString()}' this template is using method: '${archivePayload.method}'. Why are you doing this?? :(`)

  for (const contact of contacts) {
    if (!contact.ssn && !contact.externalId && !contact.recno) throw new Error('Missing required parameter in contact object "contact.ssn" or "contact.externalId" or "contact.recno')
    if (!contact.role) throw new Error('Missing required parameter in contact object "contact.role"')
    if (!archivePayload.parameter.Contacts) archivePayload.parameter.Contacts = []
    const contactObj = { Role: contact.role }
    if (contact.privatePersonRecno) contactObj.ReferenceNumber = `recno:${contact.privatePersonRecno}`
    else if (contact.enterpriseRecno) contactObj.ReferenceNumber = `recno:${contact.enterpriseRecno}`
    else if (contact.contactPersonRecno) contactObj.ExternalId = `recno:${contact.contactPersonRecno}`
    else if (contact.ssn) contactObj.ReferenceNumber = contact.ssn
    else if (contact.externalId) contactObj.ExternalId = contact.externalId
    if (contact.isUnofficial) contactObj.IsUnofficial = true
    archivePayload.parameter.Contacts.push(contactObj)
  }
  return archivePayload
}


/**
 * Call an archive template
 * 
 * @param {Object} archiveData 
 * @param {string} archiveData.system - which system to use from templates/{system}
 * @param {string} archiveData.template - which template to use from templates/{system}/{template}
 * @param {Object} archiveData.parameter - what data to use in the template
 * @param {boolean} [archiveData.getExample] - if you want to return example usage of the template instead of using the template
 * @param {boolean} [archiveData.demoRun] - if you want to see the generated template with the data provided, but not call archive
 * @param {Object} context - azure context
 * @returns result 
 */
module.exports = async (archiveData, context) => {
  const { system, template, parameter, getExample, demoRun } = archiveData
  let templateFile
  try {
    templateFile = require(`../templates/${system}/${template}`)
  } catch (error) {
    throw new HTTPError(400, `Could not find any template for system: "${system}" with name "${template}", are you sure it exists?`)
  }
  const { pdfTemplate, archiveTemplate, requiredFields, optionalFields } = templateFile
  if (!archiveTemplate) throw new HTTPError(400, `"${system}" has no template called "${template}"`)
  if (!requiredFields) throw new HTTPError(500, `Template "${system}-${template}" have not been set up with required object "requiredFields", please contact API-responsible`)

  // If user only wants a sample request
  if (getExample) {
    let templateFields = JSON.parse(JSON.stringify(requiredFields))
    if (optionalFields && typeof optionalFields === 'object') {
      for (const [ key, value ] of Object.entries(optionalFields)) {
        templateFields[`${key} (OPTIONAL)`] = value
      }
    }
    return { system, template, parameter: templateFields }
  }

  const validTemplateData = validateTemplateData(requiredFields, parameter, system, template)
  if (!validTemplateData.valid) throw new HTTPError(400, 'Provided data in "parameter" is not valid - Tip: Set property "getExample" to true, to receive example payload', validTemplateData.errorProperties)

  // Check if we need to create a pdf as well
  if (pdfTemplate) {
    logger('info', 'O-lala, we have a pdf-template - lets generate the pdf', context)
    const pdfData = pdfTemplate(parameter)
    parameter[GENERATED_PDF_PROPERTY_NAME] = await generatePdf(pdfData)
    logger('info', 'pdf generated', context)
  }
  let archivePayload = archiveTemplate(parameter)
  
  // Add attachments and contacts if needed
  if (parameter.attachments) archivePayload = addAttachments(archivePayload, parameter.attachments)
  if (parameter.contacts) archivePayload = addContacts(archivePayload, parameter.contacts)

  // Sanitize some stuff
  if (archivePayload.parameter?.Files) {
    archivePayload.parameter.Files.map(file => {
      file.Title = file.Title.replace(/"/g, "'").replace(/[<>]/g, '') // SIF håndterer ikke escaped characters i filnavn - får Illegal character in path, derav denne fiksen
      return file
    })
  }

  // If user only wants to do a demo run
  if (demoRun) {
    return archivePayload
  }

  return await callArchive(archivePayload, context)
}
