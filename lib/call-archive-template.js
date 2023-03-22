const callArchive = require('./call-archive')
const validateTemplateData = require('./validate-templatedata')
const { httpError } = require('./http-error')
const { logger } = require('@vtfk/logger')
const generatePdf = require('./generate-pdf')
const { GENERATED_PDF_PROPERTY_NAME } = require('../config')

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

module.exports = async (archiveData) => {
  const { archiveConfig, system, template, parameter, getExample, demoRun } = archiveData
  let templateFile
  try {
    templateFile = require(`../templates/${system}/${template}`)
  } catch (error) {
    return { status: 400, body: httpError(`Could not find any template for system: "${system}" with name "${template}", are you sure it exists?`) }
  }
  const { pdfTemplate, archiveTemplate, requiredFields } = templateFile
  if (!archiveTemplate) return { status: 400, body: httpError(`"${system}" has no template called "${template}"`) }
  if (!requiredFields) return { status: 500, body: httpError(`Template "${system}-${template}" have not been set up with required object "requiredFields", please contact API-responsible`) }

  // If user only wants a sample request
  if (getExample) return { status: 200, body: { archive: archiveConfig.name, system, template, parameter: requiredFields } }

  const validTemplateData = validateTemplateData(requiredFields, parameter, system, template)
  if (!validTemplateData.valid) return { status: 400, body: httpError('Provided data in "parameter" is not valid - Tip: Set property "getExample" to true, to receive example payload', validTemplateData.errorProperties) }

  // Check if we need to create a pdf as well
  if (pdfTemplate) {
    logger('info', 'O-lala, we have a pdf-template - lets generate the pdf')
    const pdfData = pdfTemplate(parameter)
    try {
      parameter[GENERATED_PDF_PROPERTY_NAME] = await generatePdf(pdfData)
    } catch (error) {
      // we don't want axios error.config
      if (typeof error === 'object') {
        delete error.config
        if (error.response) {
          const status = error.response.status || 500
          const data = error.response.data?.Details || error
          return { status, body: httpError('Failed to create PDF, something might be wrong with pdfTemplate', data) }
        }
      }
      return { status: 500, body: httpError('Failed to create PDF, something might be wrong with pdfTemplate', error) }
    }
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
    return { status: 200, body: { archivePayload } }
  }

  return await callArchive({ archiveConfig, ...archivePayload })
}
