module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'GetDocuments',
      parameter: {
        DocumentNumber: archiveData.documentNumber
      }
    }
  },
  requiredFields: {
    documentNumber: 'et dokumentnummer'
  }
}
