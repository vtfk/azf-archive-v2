const { logConfig, logger } = require('@vtfk/logger')
const { ARCHIVE_ROLE } = require('../config')
const { httpResponse } = require('../lib/http-response')
const { decodeAccessToken } = require('../lib/decode-access-token')
const { syncPrivatePerson, getSyncPrivatePersonMethod } = require('../lib/archive/sync-private-person')
const { callFintfolk } = require('../lib/fintfolk')
const { syncEmployee } = require('../lib/archive/sync-employee')

module.exports = async (context, req) => {
  logConfig({
    prefix: 'SyncEmployee'
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
    prefix: `SyncEmployee - clientId ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })

  logger('info', ['Role validated'], context)

  // Input validation
  if (!req.body) {
    const msg = 'Please pass a request body'
    logger('error', msg, context)
    return httpResponse(400, msg)
  }

  // Below, we see valid input properties in body
  const { ssn, ansattnummer, upn, forceUpdate, manualManagerEmail } = req.body

  if (!ssn && !ansattnummer && !upn) {
    logger('info', ['Missing required parameter "ssn" or "ansattnummer" or "upn"'], context)
    return httpResponse(400, 'Missing required parameter "ssn" or "ansattnummer" or "upn"')
  }

  // Get FINTFOLK DATA
  let resourceUrl
  if (ansattnummer) {
    resourceUrl = `employee/ansattnummer/${ansattnummer}`
  } else if (ssn) {
    resourceUrl = `employee/fodselsnummer/${ssn}`
  } else if (upn) {
    resourceUrl = `employee/upn/${upn}`
  } else {
    logger('info', ['WHAAT hit should we not arrive... Missing required parameter "ssn" or "ansattnummer" or "upn"'], context)
    return httpResponse(400, 'WHAAT hit should we not arrive... Missing required parameter "ssn" or "ansattnummer" or "upn"')
  }

  let fintfolkEmployee
  try {
    logger('info', ['Calling fintfolk'], context)
    fintfolkEmployee = await callFintfolk(resourceUrl)
    logger('info', ['Succesfully got response from fintfolk'], context)
  } catch (error) {
    logger('error', ['error when calling fintfolk', error.response?.data || error.stack || error.toString()], context)
    return httpResponse(500, error)
  }

  const syncPrivatePersonData = {
    ssn: fintfolkEmployee.fodselsnummer,
    forceUpdate
  }

  let privatePerson
  try {
    logger('info', ['Syncing PrivatePerson'], context)
    getSyncPrivatePersonMethod(syncPrivatePersonData) // Throws error if we do not have a valid combination of parameters
    privatePerson = await syncPrivatePerson(syncPrivatePersonData, context)
    logger('info', ['Succesfully synced PrivatePerson'], context)
  } catch (error) {
    logger('error', ['error when syncing privatePerson', error.response?.data || error.stack || error.toString()], context)
    return httpResponse(500, error)
  }

  try {
    logger('info', ['Syncing employee'], context)
    const { responsibleEnterprise, archiveManager } = await syncEmployee(privatePerson, fintfolkEmployee, manualManagerEmail, context)
    logger('info', ['Succesfully synced employee'], context)
    return httpResponse(200, { privatePerson, archiveManager, responsibleEnterprise })
  } catch (error) {
    logger('error', ['error when syncing employee', error.response?.data || error.stack || error.toString()], context)
    return httpResponse(500, error)
  }
}
