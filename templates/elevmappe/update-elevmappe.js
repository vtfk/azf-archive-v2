module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'CaseService',
      method: 'UpdateCase',
      parameter: {
        CaseNumber: archiveData.caseNumber,
        Title: 'Elevmappe',
        UnofficialTitle: `Elevmappe - ${archiveData.firstName} ${archiveData.lastName}`,
        Contacts: [
          {
            Role: 'Sakspart',
            ReferenceNumber: archiveData.ssn,
            IsUnofficial: true
          }
        ],
        SyncCaseContacts: true
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    firstName: 'Per',
    lastName: 'Son',
    ssn: '01010101010'
  }
}
