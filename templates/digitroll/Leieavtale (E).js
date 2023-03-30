module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '26',
        AccessCodeDescription: 'Offl. § 26 femte ledd (unntak for fødselsnr og nummer med tilsvarende funksjon)',
        AccessGroup: archiveData.accessGroup,
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Dokument inn',
        Contacts: [
          {
            IsUnofficial: true,
            ReferenceNumber: archiveData.ssn,
            Role: 'Avsender'
          },
          {
            ReferenceNumber: archiveData.schoolOrgnr,
            Role: 'Mottaker'
          }
        ],
        DocumentDate: archiveData.documentSignedDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'PDF',
            Status: 'F',
            Title: 'Avtale om leie av bærbar-PC nettbrett og lån av gratis læremidler (E) (signert)',
            VersionFormat: archiveData.versionFormat
          }
        ],
        Paragraph: 'Offl. § 26 femte ledd',
        ResponsibleEnterpriseNumber: archiveData.schoolOrgnr,
        Status: 'J',
        Title: 'Avtale om leie av bærbar-PC nettbrett og lån av gratis læremidler (E) (signert)',
        UnofficialTitle: `Avtale om leie av bærbar-PC nettbrett og lån av gratis læremidler (E) (signert) - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    documentSignedDate: '2021-09-27',
    base64: 'heihei',
    schoolOrgnr: '98989343',
    accessGroup: 'Elev livets harde skole',
    versionFormat: 'P',
    studentName: 'Bjarte Tjøstheim'
  }
}
