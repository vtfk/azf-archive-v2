const axios = require('axios').default
const { FREG } = require('../config')
const { getToken } = require('./get-entra-id-token')
const HTTPError = require('./http-error')

const fregSsn = async (ssn) => {
  const fregToken = await getToken(FREG.scope)
  const { data } = await axios.post(FREG.url, { ssn }, { headers: { Authorization: `Bearer ${fregToken}` } })
  if (!data.foedselsEllerDNummer) throw new Error(`Could not find anyone with that ssn ${ssn}, did someone prank you?`)
  return data
}

const fregNameBirthdate = async (name, birthdate) => {
  const dateList = birthdate.split('-')
  if (!dateList.length === 3) throw new HTTPError(400, 'birthdate must be on the format YYYY-MM-DD')
  const fregbirthdate = birthdate.replaceAll('-', '') // YYYYMMDD
  const fregToken = await getToken(FREG.scope)
  const { data } = await axios.post(FREG.url, { name, birthdate: fregbirthdate }, { headers: { Authorization: `Bearer ${fregToken}` } })
  if (!data.foedselsEllerDNummer) throw new Error('Could not find unique match on that name and birthdate')
  return data
}

module.exports = { fregSsn, fregNameBirthdate }
