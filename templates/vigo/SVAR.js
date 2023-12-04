module.exports = {
  archiveTemplate: (archiveData) => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessCodeDescription: 'Offl §13 jf. fvl §13 første ledd pkt. 1 - taushetsplikt om personlige forhold',
        AccessGroup: 'VTFK Robot',
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Dokument inn',
        Contacts: [
          {
            IsUnofficial: true,
            ReferenceNumber: archiveData.ssn,
            Role: 'Avsender'
          }
        ],
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'PDF',
            Status: 'F',
            Title: `Søkerens svar på skoleplass ${currentYear}/${nextYear}`
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsiblePersonRecno: '200326', // VTFK Robot
        ResponsibleEnterpriseRecno: '506', // Vestfold og Telemark fylkeskommune
        Status: 'J',
        Title: `Søkerens svar på skoleplass ${currentYear}/${nextYear}`,
        UnofficialTitle: `Søkerens svar på skoleplass $${currentYear}/${nextYear} - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    studentName: 'Baba Yaga',
    ssn: '01010101010',
    documentDate: '2021-09-27',
    base64: 'heihei'
  }
}
