const { logger } = require('@vtfk/logger')
const sendmail = require('../send-mail')
const { MAIL: { toArchive } } = require('../../config')
const callArchive = require('../call-archive')
const callArchiveTemplate = require('../call-archive-template')

const syncEnterprise = async (enterprise, context) => {
  const result = {
    ...enterprise,
    recno: 0,
    updated: false,
    created: false
  }
  const enterpriseRes = await callArchiveTemplate({ system: 'archive', template: 'get-enterprise', parameter: { orgnr: enterprise.EnterpriseNumber } }, context)

  if (enterpriseRes.length === 0) {
    const payload = {
      service: 'ContactService',
      method: 'SynchronizeEnterprise',
      parameter: enterprise
    }
    result.recno = await callArchive(payload, context)
    result.created = true
  } else {
    if (enterpriseRes.length > 1) {
      const mailStrBlock = `Arkiveringsroboten har funnet duplikate virksomheter i P360. Kan dere hjelpe meg ved å rydde opp virksomheter med orgnr: ${enterprise.EnterpriseNumber}? Tusen takk :)`
      try {
        await sendmail({
          to: toArchive,
          subject: 'Arkiveringsroboten har funnet duplikate virksomheter i P360',
          body: mailStrBlock
        })
      } catch (error) {
        logger('warn', ['syncEnterprise', `Sending mail failed when trying to alert about duplicate enterprise with enterprisenumber ${enterprise.EnterpriseNumber}`], context)
      }
    }

    let needsChange = false
    if (enterpriseRes[0].Name.toLowerCase() !== enterprise.Name.toLowerCase()) needsChange = true
    if (enterpriseRes[0].PostAddress?.StreetAddress?.toLowerCase() !== enterprise.PostAddress.StreetAddress.toLowerCase()) needsChange = true
    if (enterpriseRes[0].PostAddress?.ZipCode !== enterprise.PostAddress.ZipCode) needsChange = true
    if (enterpriseRes[0].OfficeAddress?.StreetAddress?.toLowerCase() !== enterprise.OfficeAddress.StreetAddress.toLowerCase()) needsChange = true
    if (enterpriseRes[0].OfficeAddress?.ZipCode !== enterprise.OfficeAddress.ZipCode) needsChange = true
    if (Array.isArray(enterpriseRes[0].Categories) && enterpriseRes[0].Categories.includes('recno:1')) needsChange = false // Dersom det er en intern virksomhet, ikke gjør noe

    result.recno = enterpriseRes[0].Recno

    if (needsChange) {
      const payload = {
        service: 'ContactService',
        method: 'UpdateEnterprise',
        parameter: {
          Recno: enterpriseRes[0].Recno,
          ...enterprise
        }
      }
      result.updated = true
      result.recno = await callArchive(payload, context)
    }
  }
  return result
}

module.exports = { syncEnterprise }
