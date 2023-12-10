const { logConfig, logger } = require('@vtfk/logger')
const { ARCHIVE_ROLE } = require('../config')
const { httpResponse } = require('../lib/http-response')
const { decodeAccessToken } = require('../lib/decode-access-token')
const { getBrregData } = require('../lib/get-brreg-data')
const { repackBrreg } = require('../lib/repack-brreg-result')
const { syncEnterprise } = require('../lib/archive/sync-enterprise')

module.exports = async (context, req) => {
  logConfig({
    prefix: 'SyncEnterprise'
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
    prefix: `SyncEnterprise - clientId ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })

  logger('info', ['Role validated'], context)

  // Input validation
  if (!req.body) {
    const msg = 'Please pass a request body'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  // Below, we see valid input properties in body
  const { orgnr } = req.body
  if (!orgnr) {
    const msg = 'Missing required parameter "orgnr"'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  try {
    logger('info', [`Fetching brregdata for orgnr: ${orgnr}`], context)
    const brregEnterprise = await getBrregData(orgnr, context)
    logger('info', [`Got brregdata for orgnr: ${orgnr}, repacking result`], context)
    const repackedEnterprise = repackBrreg(brregEnterprise)
    logger('info', [`Syncing enterprise orgnr: ${orgnr} in archive`], context)
    const enterprise = await syncEnterprise(repackedEnterprise, context)
    logger('info', [`Successfully synced enterprise orgnr: ${orgnr} in archive`], context)
    return httpResponse(200, { repackedEnterprise, enterprise })
  } catch (error) {
    logger('error', ['error when syncing enterprise', error.response?.data || error.stack || error.toString()], context)
    return httpResponse(500, error)
  }
}
