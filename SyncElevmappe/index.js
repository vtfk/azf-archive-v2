const { logConfig, logger } = require('@vtfk/logger')
const callArchive = require('../lib/call-archive')
const callArchiveTemplate = require('../lib/call-archive-template')
const { ARCHIVE_ROLE } = require('../config')
const { httpResponse } = require('../lib/http-response')
const { decodeAccessToken } = require('../lib/decode-access-token')
const { fregSsn, fregNameBirthdate } = require('../lib/freg')
const { syncPrivatePerson, getSyncPrivatePersonMethod } = require('../lib/archive/syncPrivatePerson')

module.exports = async (context, req) => {
  logConfig({
    prefix: 'SyncElevmappe'
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
    prefix: `SyncElevmappe - clientId ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })

  logger('info', ['Role validated'], context)

  // Input validation
  if (!req.body) {
    const msg = 'Please pass a request body'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  // req-body stuff: const { ssn, name, birthdate, fakeSsn, gender, streetAddress, zipCode, zipPlace, forceUpdate, manualData } = req.body

  try {
    getSyncPrivatePersonMethod(req.body) // Throws error if we do not have a valid combination of parameters
    const privatePerson = await syncPrivatePerson(req.body)
    return httpResponse(200, privatePerson)
  } catch (error) {
    return httpResponse(500, error)
  }
}
