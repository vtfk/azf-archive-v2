module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'CaseService',
      method: 'GetCases',
      parameter: {
        ExternalID: {
          Id: archiveData.caseExternalId,
          Type: 'SharePoint Case'
        }
      },
      options: {
        limit: 1
      }
    }
  },
  requiredFields: {
    caseExternalId: 'unique id'
  }
}
