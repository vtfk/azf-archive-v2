const flattenObject = require('./flatten-object')
const { GENERATED_PDF_PROPERTY_NAME } = require('../config')

const reservedPropertyNames = [GENERATED_PDF_PROPERTY_NAME]

module.exports = (requiredFields, parameter, system, template) => {
  for (const reserved of reservedPropertyNames) {
    if (requiredFields[reserved]) {
      throw new Error(`"${reserved}" is a reserved propertyname in "requiredFields", please use something else in the template: ${system}-${template}`)
    }
  }
  const errorProperties = []
  const flattenedParameter = flattenObject(parameter, { prefix: 'parameter.', flattenArray: true })
  for (const [key, value] of Object.entries(flattenObject(requiredFields, { prefix: 'parameter.', flattenArray: true }))) {
    if (!Object.prototype.hasOwnProperty.call(flattenedParameter, key, true)) {
      errorProperties.push(`Property { ${key} } [${Array.isArray(value) ? 'array' : typeof value}] is missing`)
    } else if (typeof value !== typeof flattenedParameter[key]) {
      errorProperties.push(`Property { ${key} } must be of type [${typeof value}]. Received [${typeof flattenedParameter[key]}]`)
    } else if (typeof value === 'string' && typeof flattenedParameter[key] === 'string' && flattenedParameter[key].length === 0) {
      errorProperties.push(`Property { ${key} } must have a value. Received empty string`)
    }
  }
  return { valid: errorProperties.length === 0, errorProperties }
}
