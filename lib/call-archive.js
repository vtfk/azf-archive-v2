const axios = require('axios').default
const { ALLOW_LEGACY_RENEGOTIATION } = require('../config')
const crypto = require('crypto')
const https = require('https')
const { logger } = require('@vtfk/logger')
const { httpError } = require('./http-error')

const constructRequest = config => {
  const { archiveConfig, service, method } = config
  const url = `${archiveConfig.url}/${service}/${method}`
  let headers
  if (archiveConfig.authType === 'authkey') {
    headers = { Authorization: `authkey ${archiveConfig.authkey}` }
  } else { // Add authTypes here when required (hopefully we wont have to use authkey forever...)
    throw new Error(`authType: ${archiveConfig.authType} is not a valid authType!`)
  }
  return {
    url,
    headers
  }
}

const hasSifError = response => {
  if (Object.prototype.hasOwnProperty.call(response, 'Successful') && !response.Successful) return true
  if (Object.prototype.hasOwnProperty.call(response, 'ErrorMessage') && typeof response.ErrorMessage === 'string' && response.ErrorMessage.trim().length > 0 && response.ErrorMessage !== '\n') return true
  return false
}
const repackUglySifError = response => {
  response.ErrorMessage = (response.ErrorMessage && typeof response.ErrorMessage === 'string' && response.ErrorMessage.includes('Exception:')) ? response.ErrorMessage.split('Exception:')[1].split('<operation>')[0] : response.ErrorMessage
  response.ErrorMessage = response.ErrorMessage.replace(/\\"/g, '').replace(/'/g, '').replace(/"/g, '').replace(/"/g, '`').trim()
  return response
}

module.exports = async archiveData => {
  const { parameter } = archiveData
  const { url, headers } = constructRequest(archiveData)
  try {
    const httpOptions = ALLOW_LEGACY_RENEGOTIATION ? { httpsAgent: new https.Agent({ secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT }) } : {}
    logger('info', url)
    const { data } = await axios.post(url, { parameter }, { ...httpOptions, headers })

    // Method Ping does not return a body - only status
    if (archiveData.method === 'Ping') {
      return { status: 200, body: null }
    }

    // SIF does not use http codes - check if successful
    if (hasSifError(data)) return { status: 500, body: httpError(repackUglySifError(data).ErrorMessage || 'Archive call failed', repackUglySifError(data)) }

    return { status: 200, body: data }
  } catch (error) {
    // we don't want axios error.config - it includes authkeys - also we get the most suitable message for the error
    if (typeof error === 'object') {
      delete error.config
      if (error.response) {
        const status = error.response.status || 500
        const message = error.response.data?.Message || error.toString()
        const data = error.response.data?.Details || error
        return { status, body: httpError(message, data) }
      }
    }
    return { status: 500, body: httpError(error.toString(), error) }
  }
}
