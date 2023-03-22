const { logConfig, logger } = require('@vtfk/logger')
const callArchive = require('../lib/call-archive')
const callArchiveTemplate = require('../lib/call-archive-template')
const { RAW_ROLE, ARCHIVES, DEFAULT_ARCHIVE } = require('../config')
const { httpError } = require('../lib/http-error')

module.exports = async (context, req) => {
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName}`,
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  // Check token and roles (TODO)
  const roles = ['Archive.Raw']

  // Input validation
  if (!req.body) {
    const msg = 'Please pass a request body'
    logger('error', msg)
    return { status: 400, body: httpError(msg) }
  }

  const { archive, service, method, system, template, parameter, demoRun, getExample } = req.body

  if (!parameter) {
    const msg = 'Missing required parameter "parameter"'
    logger('error', msg)
    return { status: 400, body: httpError(msg) }
  }
  // Either (service and method) or (system and template) is required
  if (!(service && method) && !(system, template)) {
    const msg = 'Missing required parameter combination ("service" and "method") or ("system" and "template")'
    logger('error', msg)
    return { status: 400, body: httpError(msg) }
  }
  // If raw call, verify both role and parameters
  if (service && method && !roles.includes(RAW_ROLE)) {
    const msg = `Parameters "service" and "method" requires role ${RAW_ROLE}`
    logger('error', msg)
    return { status: 401, body: httpError(msg) }
  }

  // Validate that parameter is valid json
  try {
    JSON.parse(JSON.stringify(parameter))
  } catch (error) {
    const msg = 'Parameter "parameter" must be valid json!'
    logger('error', msg)
    return { status: 400, body: httpError(msg) }
  }

  // Validate that archive is a valid archive
  let archiveConfig = ARCHIVES.find(a => a.name.toLowerCase() === archive?.toLowerCase())
  if (!archiveConfig) {
    logger('info', ['Parameter archive is not set, will use default', DEFAULT_ARCHIVE])
    archiveConfig = ARCHIVES.find(a => a.name.toLowerCase() === DEFAULT_ARCHIVE.toLowerCase())
    if (!archiveConfig) {
      const msg = `Default archive: ${DEFAULT_ARCHIVE} does not exist! Contact API-responsible.`
      logger('error', msg)
      return { status: 500, body: httpError(msg) }
    }
  } else {
    logger('info', ['Paramter archive is set, will archive to', archive])
  }

  // Finished validation - we have either service, method and RAW_ROLE, or we have system and template, and we have valid archive
  logConfig({
    prefix: `${context.invocationId} - ${context.bindingData.sys.methodName} - ${archive} - ${service || system} - ${method || template}`
  })

  // Raw call
  if (service && method) {
    try {
      const result = await callArchive({ archiveConfig, service, method, parameter })
      return result // callArchive handles http result
    } catch (error) {
      logger('error', ['Raw archive call failed', error.toString(), error])
      return { status: 500, body: { message: error.toString(), data: error.stack || null } }
    }
  }

  //  Template call
  if (system && template) {
    try {
      const result = await callArchiveTemplate(({ archiveConfig, system, template, parameter, getExample, demoRun }))
      return result // callArchiveTemplate handles http result
    } catch (error) {
      logger('error', ['Template archive call failed', error.toString(), error])
      return { status: 500, body: { message: error.toString(), data: error.stack || null } }
    }
  }
}
