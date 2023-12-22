module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessGroup: archiveData.accessGroup,
        Category: 'Dokument ut',
        Contacts: [
          {
            IsUnofficial: true,
            ReferenceNumber: archiveData.ssn,
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
            Title: archiveData.fileTitle,
            VersionFormat: 'A'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseNumber: archiveData.schoolEnterpriseNumber,
        ResponsiblePersonRecno: archiveData.responsiblePersonRecno,
        Status: 'R',
        Title: archiveData.title,
        UnofficialTitle: archiveData.unofficialTitle,
        Archive: 'Elevdokument',
        CaseNumber: archiveData.caseNumber
      }
    }
  },
  requiredFields: {
    base64: 'fhdjfhdjkfjsdf',
    title: 'dokument',
    fileTitle: 'dokujuu',
    unofficialTitle: 'dokument huhuhu',
    ssn: '12345678910',
    documentDate: '2021-09-27',
    caseNumber: '30/00000',
    schoolEnterpriseNumber: '202002',
    accessGroup: 'elev belev',
    responsiblePersonRecno: '12345'
  }
}
