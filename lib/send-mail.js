const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const { MAIL: { bcc, cc, from, signature, url, secret, templateName } } = require('../config')

module.exports = async (options, context) => {
  const { to, subject, body } = options
  const payload = {
    to,
    from,
    subject,
    template: {
      templateName,
      templateData: {
        body,
        signature
      }
    }
  }
  if (cc) payload.cc = cc // don't add them to payload if not necessary (mail-api throws error when empty list)
  if (bcc) payload.bcc = bcc
  try {
    const headers = { 'x-functions-key': secret }
    const { data } = await axios.post(`${url}`, payload, { headers })
    logger('info', ['send-mail', 'mail sent', 'to', payload.to, 'cc', cc, 'bcc', bcc], context)
    return data
  } catch (error) {
    logger('error', ['send-mail', 'failed to send mail', 'to', payload.to, 'cc', cc, 'bcc', bcc, error.response?.data || error.stack || error.toString()], context)
    return null
  }
}
