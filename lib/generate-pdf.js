const axios = require('axios').default
const { PDF_GENERATOR: { url } } = require('../config')

module.exports = async pdfData => {
  const { data } = await axios.post(url, pdfData)
  return data.data.base64
}
