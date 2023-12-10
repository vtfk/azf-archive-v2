const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const { BRREG: { url, branchUrl } } = require('../config')

const getBrregData = async (orgnr, context) => {
  // Attempt to get a company from brreg, if not found, attempt to get the branch
  try {
    const { data } = await axios.get(`${url}${orgnr}`)
    return data
  } catch (error) {
    try {
      const branch = await axios.get(`${branchUrl}${orgnr}`)
      return branch.data
    } catch (err) {
      const status = err.response?.status || err.statusCode || err.message?.status || 500
      const data = err.response?.data || err.message || err.toString()
      logger('error', ['get-brreg-data', status, data], context)
      throw new HTTPError(status, data)
    }
  }
}

module.exports = { getBrregData }
