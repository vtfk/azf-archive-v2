module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ContactService',
      method: 'GetEnterprises',
      parameter: {
        EnterpriseNumber: archiveData.orgnr,
        Active: 'true'
      }
    }
  },
  requiredFields: {
    orgnr: '01010101010'
  }
}
