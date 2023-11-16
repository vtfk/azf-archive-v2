module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'CaseService',
      method: 'GetCases',
      parameter: {
        Title: 'Elevmappe%',
        ContactReferenceNumber: archiveData.ssn,
        IncludeCaseContacts: true
      }
    }
  },
  requiredFields: {
    ssn: '12345678910'
  }
}
