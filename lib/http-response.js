const HTTPError = require("./http-error")

// Simple http response handler, handles axios error as well as plain js errors
const httpResponse = (statuscode, data) => {
  if (!statuscode) throw new Error('Missing required parameter "statuscode"')
  if (!data) throw new Error('Missing required parameter "data"')
  if (statuscode === 200) return { status: statuscode, body: data }

  if (data instanceof HTTPError) {
    // Http error instance
    return { status: data.statusCode, body: { message: data.message, data: data.data } } // Hahah, data: data.data
  }

  if (data instanceof Error) {
    // Error instance, probs axios
    const status = data.response?.status || statuscode
    const error = data.response?.data || data.stack || data.toString()
    const message = data.toString()
    return { status, body: { message, data: error } }
  }
  // If i just sent a string for some reason, because i am lazy
  if (typeof data === 'string') return { status: statuscode, body: { message: data, data: null } }

  return { status: statuscode, body: data }
}

module.exports = { httpResponse }