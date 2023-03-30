module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ContactService',
      method: 'GetPrivatePersons',
      parameter: {
        PersonalIdNumber: archiveData.ssn,
        Active: 'true'
      }
    }
  },
  requiredFields: {
    ssn: '01010101010'
  }
}
