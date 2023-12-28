module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessGroup: archiveData.accessGroup,
        Category: 'Internt notat uten oppfølging',
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
        ResponsibleEnterpriseNumber: archiveData.schoolEnterpriseNumber,
        ResponsiblePersonRecno: archiveData.responsiblePersonRecno,
        Status: 'J',
        Title: archiveData.title,
        UnofficialTitle: archiveData.unofficialTitle,
        Archive: 'Senstitivt elevdokument',
        CaseNumber: archiveData.caseNumber
      }
    }
  },
  requiredFields: {
    base64: 'fhdjfhdjkfjsdf',
    title: 'dokument',
    unofficialTitle: 'dokument huhuhu',
    documentDate: '2021-09-27',
    caseNumber: '30/00000',
    schoolEnterpriseNumber: '202002',
    accessGroup: 'elev belev',
    responsiblePersonRecno: '12345'
  }
}
