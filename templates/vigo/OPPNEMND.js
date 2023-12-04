module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessCodeDescription: 'Offl §13 jf. fvl §13 første ledd pkt. 1 - taushetsplikt om personlige forhold',
        AccessGroup: 'Fagopplæring',
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Internt notat / e-post UTEN oppfølging',
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData.base64,
            Category: '1',
            Format: 'PDF',
            Status: 'F',
            Title: 'Oppmelding sendt nemnd'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsiblePersonRecno: '200065', // Seksjon for fag- og yrkesopplæring
        ResponsibleEnterpriseRecno: '200065', // Seksjon for fag- og yrkesopplæring
        Status: 'J',
        Title: 'Oppmelding sendt nemnd',
        UnofficialTitle: `Oppmelding sendt nemnd - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    studentName: 'Tjorvald Krasastutt',
    documentDate: '2021-09-27',
    base64: 'heihei'
  }
}
