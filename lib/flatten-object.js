/**
 *
 * @param {Object} obj - object that you want to flatten
 * @param {string} [options.prefix=''] - prefix for all property-names
 * @param {string} [options.flattenArray=false] - if you want to flatten arrays as well
 * @returns flattened object
 */
const flattenObject = (obj, options) => {
  if (!options.prefix) options.prefix = ''
  if (!options.flattenArray) options.flattenArray = false
  const flattened = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, { prefix: `${options.prefix}${key}.`, flattenArray: options.flattenArray }))
    } else if (options.flattenArray && Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value.reduce((a, v, i) => ({ ...a, [`${options.prefix}${key}[${i}]`]: v })), { prefix: `${options.prefix}${key}.`, flattenArray: options.flattenArray }))
    } else {
      flattened[`${options.prefix}${key}`] = value
    }
  })
  return flattened
}

module.exports = flattenObject
