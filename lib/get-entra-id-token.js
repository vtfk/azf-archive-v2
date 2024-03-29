const { ConfidentialClientApplication } = require('@azure/msal-node')
const NodeCache = require('node-cache')
const { APPREG_CLIENT } = require('../config')
const { logger } = require('@vtfk/logger')

const cache = new NodeCache({ stdTTL: 4000 })

const getToken = async (scope, options = { forceNew: false }) => {
  const cacheKey = scope

  if (!options.forceNew && cache.get(cacheKey)) {
    logger('info', ['getEntraIdToken', 'found valid token in cache, will use that instead of fetching new'])
    return (cache.get(cacheKey))
  }

  logger('info', ['getEntraIdToken', 'no token in cache, fetching new from Microsoft'])
  const config = {
    auth: {
      clientId: APPREG_CLIENT.clientId,
      authority: `https://login.microsoftonline.com/${APPREG_CLIENT.tenantId}`,
      clientSecret: APPREG_CLIENT.clientSecret
    }
  }

  // Create msal application object
  const cca = new ConfidentialClientApplication(config)
  const clientCredentials = {
    scopes: [scope]
  }

  const token = await cca.acquireTokenByClientCredential(clientCredentials)
  const expires = Math.floor((token.expiresOn.getTime() - new Date()) / 1000)
  logger('info', ['getEntraIdToken', `Got token from Microsoft, expires in ${expires} seconds.`])
  cache.set(cacheKey, token.accessToken, expires)
  logger('info', ['getEntraIdToken', 'Token stored in cache'])

  return token.accessToken
}

module.exports = { getToken }
