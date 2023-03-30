module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'UpdateDocument',
      parameter: {
        DocumentNumber: archiveData.documentNumber,
        Permissions: [
          {
            AccessGroup: archiveData.accessGroup,
            AccessLevel: 'Read',
            Grant: false,
            ViewFile: true
          }
        ]
      }
    }
  },
  requiredFields: {
    documentNumber: '21/00012-1',
    accessGroup: 'Elev livets skole'
  }
}
