const axios = require('axios').default
const { FINTFOLK } = require('../config')
const { getToken } = require('./get-entra-id-token')

/**
 *
 * @param {string} resource on the form "{resource}/{identifikator}/{identifikatorverdi}?{params}"
 * @returns response
 */
const callFintfolk = async (resource) => {
  const fintfolkToken = await getToken(FINTFOLK.scope)
  const { data } = await axios.get(`${FINTFOLK.url}/${resource}`, { headers: { Authorization: `Bearer ${fintfolkToken}` } })
  return data
}

module.exports = { callFintfolk }
