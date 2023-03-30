module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessCodeDescription: 'Offl §13 jf. fvl §13 første ledd pkt. 1 - taushetsplikt om personlige forhold',
        AccessGroup: 'VTFK Robot',
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Dokument ut',
        Contacts: [
          {
            IsUnofficial: true,
            ReferenceNumber: archiveData.ssn,
            Role: 'mottaker'
          }
        ],
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'PDF',
            Status: 'F',
            Title: 'Tilbud om skoleplass skoleåret 2023/2024'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsiblePersonRecno: '200326',
        ResponsibleEnterpriseRecno: '506',
        Status: 'J',
        Title: 'Tilbud om skoleplass skoleåret 2023/2024',
        UnofficialTitle: 'Tilbud om skoleplass skoleåret 2023/2024'
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    documentDate: '2021-09-27',
    base64: 'heihei'
  }
}
