module.exports = {
  archiveTemplate: (archiveData) => {
    const currentYear = new Date().getFullYear()
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessCodeDescription: 'Offl §13 jf. fvl §13 første ledd pkt. 1 - taushetsplikt om personlige forhold',
        AccessGroup: 'Fagopplæring',
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
            Title: 'Formidlingsstatus 2023'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsiblePersonRecno: '200065', // Seksjon for fag- og yrkesopplæring
        ResponsibleEnterpriseRecno: '200065', // Seksjon for fag- og yrkesopplæring
        Status: 'J',
        Title: `Formidlingsstatus ${currentYear}`,
        UnofficialTitle: `Formidlingsstatus ${currentYear} - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    studentName: 'Frankenstein Hansen',
    documentDate: '2021-09-27',
    base64: 'heihei'
  }
}
