const { logConfig, logger } = require('@vtfk/logger')
const { ARCHIVE_ROLE } = require('../config')
const { httpResponse } = require('../lib/http-response')
const { decodeAccessToken } = require('../lib/decode-access-token')
const syncSharePointSite = require('../lib/archive/sync-sharepoint-site')

const validateInput = (body) => {
  const { siteUrl, projectTitle, responsiblePersonEmail, caseExternalId, caseTitle } = body
  if (!siteUrl) {
    throw new HTTPError(400, 'Missing required parameter "siteUrl"')
  }
  if (typeof siteUrl !== 'string') {
    throw new HTTPError(400, '"siteUrl" must be string')
  }
  if (!caseTitle) {
    throw new HTTPError(400, 'Missing required parameter "caseTitle"')
  }
  if (typeof caseTitle !== 'string') {
    throw new HTTPError(400, '"caseTitle" must be string')
  }
  if (!projectTitle) {
    throw new HTTPError(400, 'Missing required parameter "projectTitle"')
  }
  if (typeof projectTitle !== 'string') {
    throw new HTTPError(400, '"projectTitle" must be string')
  }
  if (!responsiblePersonEmail) {
    throw new HTTPError(400, 'Missing required parameter "responsiblePersonEmail"')
  }
  if (typeof responsiblePersonEmail !== 'string') {
    throw new HTTPError(400, '"responsiblePersonEmail" must be string')
  }
  if (!caseExternalId) {
    throw new HTTPError(400, 'Missing required parameter "caseExternalId"')
  }
  if (typeof caseExternalId !== 'string') {
    throw new HTTPError(400, '"caseExternalId" must be string')
  }
}

module.exports = async (context, req) => {
  logConfig({
    prefix: 'SyncSharepointSite'
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
    prefix: `SyncSharepointSite - clientId ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })

  logger('info', ['Role validated'], context)

  // Input validation
  if (!req.body) {
    const msg = 'Please pass a request body'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  // Below, we see valid input properties in body
  const { siteUrl, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph, caseType } = req.body
  try {
    validateInput(req.body)
  } catch (error) {
    return httpResponse(500, msg)
  }
  const input = {
    siteUrl, projectTitle, responsiblePersonEmail, projectNumber, caseExternalId, caseTitle, accessGroup, paragraph, caseType
  }
  try {
    logger('info', `Trying to sync SharePointSite: SiteUrl: ${siteUrl}`)
    const result = await syncSharePointSite(input, context)
    logger('info', `Succesfully synced SharePointSite. SiteUrl: ${siteUrl}`)
    return httpResponse(200, result)
  } catch (error) {
    logger('error', ['error when syncing SharePointSite', error.response?.data || error.stack || error.toString()], context)
    return httpResponse(500, error)
  }
}
