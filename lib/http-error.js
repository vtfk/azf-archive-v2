class HTTPError extends Error {
  constructor (code, message, data) {
    super(message)

    this.statusCode = code
    this.message = message
    this.data = data || null
  }
}

module.exports = HTTPError