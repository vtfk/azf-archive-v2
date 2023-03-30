module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'GetDocuments',
      parameter: {
        CaseNumber: archiveData.caseNumber,
        IncludeAccessMatrixRowPermissions: true
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000'
  }
}
