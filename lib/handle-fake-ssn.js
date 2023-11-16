const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const callArchiveTemplate = require('./call-archive-template')
const { COUNTY_NUMBER } = require('../config')


const newFakeSsn = (birthdate, gender, runningNumber) => {
  const dateList = birthdate.split('-')
  if (!dateList.length === 3) throw new HTTPError(400, 'birthdate must be on format YYYY-MM-DD')
  const year = dateList[0]
  const month = dateList[1]
  const day = dateList[2]
  const birthdateFormatted = `${day}${month}${year.substring(2,4)}`
  const newBirthdate = `${Number(birthdateFormatted.substring(0, 1)) + 4}${birthdateFormatted.substring(1, 6)}`
  if (runningNumber < 10) runningNumber = `0${runningNumber}`
  const genderNumber = gender.toLowerCase() === 'm' ? 1 : 2
  const countyNumber = COUNTY_NUMBER
  return `${newBirthdate}${runningNumber}${genderNumber}${countyNumber}`
}

const getLastName = (name) => {
  const nameList = name.split(' ')
  if (nameList.length < 2) throw new HTTPError(400, 'Name must have at least one whitespace in it...')
  return nameList[nameList.length - 1]
}

const handleFakeSsn = async (birthdate, gender, name, context) => {
  if (!name) {
    throw new HTTPError(400, 'Missing required parameter "lastName"')
  }
  if (!birthdate) {
    throw new HTTPError(400, 'Missing required parameter "birthdate"')
  }
  if (!gender) {
    throw new HTTPError(400, 'Missing required parameter "gender"')
  }

  let foundUnique = false
  let runningNumber = 99
  let resultSsn
  let privatePersonResult = null
  const lastName = getLastName(name)
  while (!foundUnique) {
    const fakeSsn = newFakeSsn(birthdate, gender, runningNumber)
    const privatePersonRes = await callArchiveTemplate({ system: 'archive', template: 'get-private-person', parameter: { ssn: fakeSsn } }, context)
    privatePersonResult = privatePersonRes
    if (privatePersonRes.length === 1 && privatePersonRes[0].LastName === lastName) {
      foundUnique = true
      resultSsn = fakeSsn
    } else if (privatePersonRes.length === 0) {
      foundUnique = true
      resultSsn = fakeSsn
    } else if (privatePersonRes.length > 1) {
      throw new HTTPError(500, `Found several privatepersons on fake ssn ${fakeSsn}, send to arkivarer for handling (av tre pils til Jorgen)`)
    } else {
      runningNumber -= 1
      if (runningNumber < 1) throw new Error(`AIAIA, no all 99 running numbers have been used up for fake ssn on birthdate ${birthdate} and gender ${gender} - what to do, what to do...`)
      // Consider to add sleep function, if it fails a lot
    }
  }

  return { resultSsn, privatePersonResult }
}

module.exports = { handleFakeSsn, newFakeSsn }
