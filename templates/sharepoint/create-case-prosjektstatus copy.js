module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'CaseService',
      method: 'CreateCase',
      parameter: {
        CaseType: 'Sak',
        Project: archiveData.projectNumber,
        Title: archiveData.caseTitle,
        UnofficialTitle: archiveData.caseTitle,
        Status: 'R',
        FiledOnPaper: false,
        ResponsiblePersonEmail: archiveData.responsiblePersonEmail,
        AccessGroup: archiveData.accessGroup,
        Paragraph: archiveData.paragraph,
        ExternalID: {
          Id: archiveData.caseExternalId,
          Type: 'SharePoint Case'
        }
      }
    }
  },
  requiredFields: {
    caseTitle: 'Hei',
    projectNumber: '23-2',
    responsiblePersonEmail: 'jallaballa@vtfk.no',
    accessGroup: 'Alle',
    paragraph: '13',
    caseExternalId: '{siteUrl}-{sakstype (f. eks prosjektstatus)}-{sharepoint-site-guid}'
  }
}
