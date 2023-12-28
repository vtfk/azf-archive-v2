module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: archiveData.accessCode,
        AccessGroup: archiveData.accessGroup,
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Internt notat uten oppfølging',
        DocumentDate: archiveData.publishedDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'PNG',
            Status: 'F',
            Title: `Prosjektstatus - ${archiveData.projectName} - ${archiveData.publishedDate}`,
            VersionFormat: 'P'
          }
        ],
        Paragraph: archiveData.paragraph,
        ResponsiblePersonEmail: archiveData.projectOwnerEmail,
        Status: 'J',
        Title: `Prosjektstatus - ${archiveData.projectName} - ${archiveData.publishedDate}`,
        UnofficialTitle: `Prosjektstatus - ${archiveData.projectName} - ${archiveData.publishedDate}`
      }
    }
  },
  requiredFields: {
    accessGroup: 'Elev vgs',
    accessCode: 'U',
    caseNumber: '30/00000',
    publishedDate: '2021-09-27',
    base64: 'heihei',
    projectOwnerEmail: 'Saken om kjeks@heihieh.no',
    paragraph: 'Ingen paragraf gitt',
    projectName: 'Tut tut'
  }
}
