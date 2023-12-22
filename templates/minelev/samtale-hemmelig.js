module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessGroup: archiveData.accessGroup,
        Category: 'Internt notat / e-post MED oppfølging',
        Contacts: [
          {
            ReferenceNumber: archiveData.organizationNumber,
            Role: 'Avsender'
          },
          {
            ReferenceNumber: archiveData.organizationNumber,
            Role: 'Mottaker'
          }
        ],
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'pdf',
            Status: 'F',
            Title: archiveData.title,
            VersionFormat: 'A'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseNumber: archiveData.organizationNumber,
        ResponsiblePersonRecno: archiveData.responsiblePersonRecno,
        Status: 'J',
        Title: archiveData.title,
        UnofficialTitle: archiveData.unofficialTitle,
        Archive: 'Elevdokument',
        CaseNumber: archiveData.caseNumber
      }
    }
  },
  requiredFields: {
    organizationNumber: '00000',
    base64: 'fjkdsfhkdshkjfds',
    accessGroup: 'Elev gul skole',
    title: 'Tittlen',
    unofficialTitle: 'uosfififkefxszsd tittkdlf',
    documentDate: '2021-09-27',
    caseNumber: '30/00000',
    responsiblePersonRecno: '343566'
  }
}
