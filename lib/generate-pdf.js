const axios = require('axios').default
const { PDF_GENERATOR: { url, key } } = require('../config')

module.exports = async pdfData => {
  const { data } = await axios.post(url, pdfData, { headers: { 'x-functions-key': key } })
  return data.data.base64
}
