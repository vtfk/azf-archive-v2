const { readdirSync, lstatSync } = require('fs')
const flattenObject = require('../lib/flatten-object')
const { GENERATED_PDF_PROPERTY_NAME } = require('../config')
const exp = require('constants')

const systems = readdirSync('./templates').filter(ele => lstatSync(`./templates/${ele}`).isDirectory()) // outside the test working dir is root foler

const validateFields = (flattenedFields, type) => {
  for (const [key, value] of Object.entries(flattenedFields)) {
    if (value === undefined || value === null) return `Oh shait, ${key} has null or undefined value... Please fix template...`
    if (typeof value === 'string' && value.includes('undefined')) return `Oh shait, ${key} has null or undefined value... Please fix template...`
  }
  if (type === 'archive') {
    if (!flattenedFields.service) return 'Whops, did you forget to add "service" to archiveTemplate?'
    if (!flattenedFields.method) return 'Whops, did you forget to add "method" to archiveTemplate?'
  }
  if (type === 'pdf') {
    if (!flattenedFields.system) return 'Whops, did you forget to add "system" to pdfTemplate?'
    if (!flattenedFields.template) return 'Whops, did you forget to add "template" to pdfTemplate?'
  }
  return 'Okidoki!'
}

/*
test('Exception thrown when "template" is not defined', () => {
  const fn = () => createMetadata({})
  expect(fn).toru
  expect(fn).toThrow(HTTPError)
})
*/

describe.each(systems)('Verifying templates for system: %p', system => {
  const templates = readdirSync(`./templates/${system}`)
  test.each(templates)('Expect template %p to generate successfully', (template) => {
    const { pdfTemplate, archiveTemplate, requiredFields } = require(`../templates/${system}/${template}`)
    if (pdfTemplate) {
      const pdfValidation = validateFields(flattenObject(pdfTemplate(requiredFields), { flattenArray: true }), 'pdf')
      expect(pdfValidation).toBe('Okidoki!')
      // Mock that pdf is created
      requiredFields[GENERATED_PDF_PROPERTY_NAME] = 'base64base64blablabla=='
    }
    const archiveValidation = validateFields(flattenObject(archiveTemplate(requiredFields), { flattenArray: true }), 'archive')
    expect(archiveValidation).toBe('Okidoki!')
  })
})
