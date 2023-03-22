/**
 * @param {string} message - error message (summary of the error)
 * @param {*} [error=null] - error data (if relevant)
 * @returns {Object}
 */
const httpError = (message, error = null) => {
  return { message, error }
}

module.exports = { httpError }
