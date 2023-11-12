const { logConfig, logger } = require('@vtfk/logger')
const callArchive = require('../lib/call-archive')
const callArchiveTemplate = require('../lib/call-archive-template')
const { ARCHIVE_ROLE } = require('../config')
const { httpResponse } = require('../lib/http-response')
const { decodeAccessToken } = require('../lib/decode-access-token')
const HTTPError = require('../lib/http-error')

module.exports = async (context, req) => {
  logConfig({
    prefix: 'Archive'
  })
  // Verify token
  const decoded = decodeAccessToken(req.headers.authorization)

  if (!decoded.verified) {
    logger('warn', ['Token is not valid', decoded.msg], context)
    return httpResponse(401, decoded.msg)
  }

  logger('info', ['Validating role'], context)
  if (!decoded.roles.includes(ARCHIVE_ROLE)) {
    logger('info', ['Missing required role for access'], context)
    return httpResponse(403, 'Missing required role for access')
  }

  logConfig({
    prefix: `Archive - clientId ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })

  logger('info', ['Role validated'], context)

  // Input validation
  if (!req.body) {
    const msg = 'Please pass a request body'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  const { service, method, system, template, parameter, demoRun, getExample, options } = req.body
  if (!parameter) {
    const msg = 'Missing required parameter "parameter"'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }
  // Either (service and method) or (system and template) is required
  if (!(service && method) && !(system, template)) {
    const msg = 'Missing required parameter combination ("service" and "method") or ("system" and "template")'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  // Validate that parameter is valid json
  try {
    JSON.parse(JSON.stringify(parameter))
  } catch (error) {
    const msg = 'Parameter "parameter" must be valid json!'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }
  // Validate that options is valid json if exists
  try {
    if (options) JSON.parse(JSON.stringify(options))
  } catch (error) {
    const msg = 'Parameter "options" must be valid json!'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  // Finished validation - we have valid role, either service, method, or system and template
  logConfig({
    prefix: `Archive - clientId ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''} - ${service || system} - ${method || template}`
  })

  // Raw call
  if (service && method) {
    try {
      const archiveResult = await callArchive({ service, method, parameter, options }, context)
      return httpResponse(200, archiveResult)
    } catch (error) {
      logger('error', ['Raw archive call failed', error.response?.data || error.stack || error.toString()], context)
      return httpResponse(500, error) // 500 is fallback status code
    }
  }

  //  Template call
  if (system && template) {
    try {
      const templateResult = await callArchiveTemplate({ system, template, parameter, getExample, demoRun }, context)
      return httpResponse(200, templateResult)
    } catch (error) {
      logger('error', ['Template archive call failed', error.response?.data || error.stack || error.toString()], context)
      return httpResponse(500, error)
    }
  }
}
