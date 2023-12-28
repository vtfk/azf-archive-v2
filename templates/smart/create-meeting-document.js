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
        DocumentDate: archiveData.meetingDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'PDF',
            Status: 'F',
            Title: archiveData.meetingElementTitle,
            VersionFormat: 'A'
          }
        ],
        Paragraph: archiveData.paragraph,
        ResponsibleEnterpriseRecno: archiveData.responsibleEnterpriseRecno,
        Status: 'J',
        Title: archiveData.meetingElementTitle,
        UnofficialTitle: archiveData.meetingElementTitle
      }
    }
  },
  requiredFields: {
    accessGroup: 'Elev vgs',
    accessCode: 'U',
    caseNumber: '30/00000',
    meetingDate: '2021-09-27',
    base64: 'heihei',
    meetingElementTitle: 'Saken om kjeks',
    responsibleEnterpriseRecno: '306',
    paragraph: 'Ingen paragraf gitt'
  }
}
