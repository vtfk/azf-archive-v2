module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'UpdateDocument',
      parameter: {
        DocumentNumber: archiveData.documentNumber,
        Status: 'U'
      }
    }
  },
  requiredFields: {
    documentNumber: '30/00000-12'
  }
}
