module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'SignOffDocument',
      parameter: {
        Document: archiveData.documentNumber,
        ResponseCode: 'TO',
        Note: 'Dokumentet er avskrevet med koden TO – Tatt til orientering'
      }
    }
  },
  requiredFields: {
    documentNumber: '30/00000-1'
  }
}
