const axios = require('axios').default
const { FREG } = require('../config')
const { getToken } = require('./get-entra-id-token')



const fregSsn = async (ssn) => {
  const fregToken = await getToken(FREG.scope)
  const { data } = await axios.post(FREG.url, { ssn }, { headers: { Authorization: `Bearer ${fregToken}` } })
  if (!data.foedselsEllerDNummer) throw new Error(`Could not find anyone with that ssn ${ssn}, did someone prank you?`)
  return data
}

const fregNameBirthdate = async (name, birthdate) => {
  const fregToken = await getToken(FREG.scope)
  const { data } = await axios.post(FREG.url, { name, birthdate }, { headers: { Authorization: `Bearer ${fregToken}` } })
  if (!data.foedselsEllerDNummer) throw new Error('Could not find unique match on that name and birthdate')
  return data
}

module.exports = { fregSsn, fregNameBirthdate }