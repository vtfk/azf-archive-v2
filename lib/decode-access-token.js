const { decode } = require('jsonwebtoken')

/**
 * @typedef {Object} Decoded
 * @property {string} upn - UserPrincipalName
 * @property {string} appid - Application id
 * @property {boolean} verified - If the token passes the checks
 * @property {string} msg - Descriptive message if the verification fails
 * @property {Array} roles - Roles for the token
 */

/**
 *
 * @param {string} token
 * @return {Decoded}
 */
const decodeAccessToken = (token) => {
  const result = {
    upn: '',
    appid: '',
    oid: '',
    verified: false,
    msg: '',
    roles: []
  }

  if (!token) {
    result.msg = 'Missing token in authorization header'
    return result
  }

  let decoded
  try {
    decoded = decode(token.replace('Bearer ', ''))
  } catch (error) {
    result.msg = 'Token is not a valid jwt'
    return result
  }

  if (!decoded) {
    result.msg = 'Token is not a valid jwt'
    return result
  }

  const { upn, appid, roles, oid } = decoded
  if (!upn && !appid) {
    result.msg = 'Token is missing upn or appId'
    return result
  }

  result.appid = appid
  result.upn = upn || 'appReg'
  result.oid = oid
  result.verified = true
  result.roles = roles || []

  return result
}

module.exports = { decodeAccessToken }
