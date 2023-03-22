const { readdirSync, lstatSync } = require('fs')
const flattenObject = require('../lib/flatten-object')
const { GENERATED_PDF_PROPERTY_NAME } = require('../config')

const systems = readdirSync('./templates').filter(ele => lstatSync(`./templates/${ele}`).isDirectory()) // outside the test working dir is root foler

const validateFields = (flattenedFields) => {
  for (const [key, value] of Object.entries(flattenedFields)) {
    if (value === undefined || value === null) return `Oh shait, ${key} has null or undefined value... Please fix template...`
    if (typeof value === 'string' && value.includes('undefined')) return `Oh shait, ${key} has null or undefined value... Please fix template...`
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
  // const templates = readdirSync(`./templates/archive`)
  test.each(templates)('Expect template %p to generate successfully', (template) => {
    const { pdfTemplate, archiveTemplate, requiredFields } = require(`../templates/${system}/${template}`)
    // const { pdfTemplate, archiveTemplate, requiredFields } = require(`../templates/archive/get-documents`)
    if (pdfTemplate) {
      const pdfValidation = validateFields(flattenObject(pdfTemplate(requiredFields), { flattenArray: true }))
      expect(pdfValidation).toBe('Okidoki!')
      // Mock that pdf is created
      requiredFields[GENERATED_PDF_PROPERTY_NAME] = 'base64base64blablabla=='
    }
    const archiveValidation = validateFields(flattenObject(archiveTemplate(requiredFields), { flattenArray: true }))
    expect(archiveValidation).toBe('Okidoki!')
  })
})
