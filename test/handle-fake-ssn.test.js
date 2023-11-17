const { COUNTY_NUMBER } = require('../config')
const { newFakeSsn } = require('../lib/handle-fake-ssn')

const manBefore2000 = {
  birthdate: '1993-01-29',
  gender: 'm',
  runningNumber: 99
}

const womanAfter2000 = {
  birthdate: '2002-10-02',
  gender: 'f',
  runningNumber: 4
}

describe('New fake ssn is generated as expected', () => {
  test('When subject is man born before 2000, running number is two digits', () => {
    const fakeSsn = newFakeSsn(manBefore2000.birthdate, manBefore2000.gender, manBefore2000.runningNumber)
    expect(fakeSsn).toBe(`690193991${COUNTY_NUMBER}`)
  })
  test('When subject is woman born after 2000, running number is one digit', () => {
    const fakeSsn = newFakeSsn(womanAfter2000.birthdate, womanAfter2000.gender, womanAfter2000.runningNumber)
    expect(fakeSsn).toBe(`421002042${COUNTY_NUMBER}`)
  })
})
