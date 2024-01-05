const axios = require('axios').default
const { ALLOW_LEGACY_RENEGOTIATION, ARCHIVE } = require('../config')
const crypto = require('crypto')
const https = require('https')
const { logger } = require('@vtfk/logger')
const { hasSifError, repackSifResult, repackUglySifError } = require('./repack-sif-result')
const HTTPError = require('./http-error')

const constructRequest = config => {
  const { service, method } = config
  const url = `${ARCHIVE.url}/${service}/${method}?clientId=${ARCHIVE.clientId}`
  const headers = { Authorization: `authkey ${ARCHIVE.authkey}` }
  return { url, headers }
}

/**
 *
 * @param {Object} archiveData
 * @param {string} archiveData.service
 * @param {string} archiveData.method
 * @param {Object} archiveData.parameter
 * @param {Object} [archiveData.options]
 * @param {Object} [context]
 * @returns
 */
module.exports = async (archiveData, context) => {
  const { parameter, options, service, method } = archiveData
  const { url, headers } = constructRequest(archiveData)
  const httpOptions = ALLOW_LEGACY_RENEGOTIATION ? { httpsAgent: new https.Agent({ secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT }) } : {}
  logger('info', ['Sending request to P360', 'service', service, 'method', method], context)
  const { data } = await axios.post(url, { parameter }, { ...httpOptions, headers })
  logger('info', ['Got response', 'service', service, 'method', method], context)

  // Method Ping does not return a body - only status
  if (archiveData.method.toLowerCase() === 'ping') {
    logger('info', 'Ping pong, quick return', context)
    return 'Ping successful :)'
  }

  // SIF does not use http codes - check if successful
  if (hasSifError(data)) {
    throw new HTTPError(500, repackUglySifError(data).ErrorMessage || 'Archive call failed')
  }

  const repacked = repackSifResult(data, options)

  return repacked
}
