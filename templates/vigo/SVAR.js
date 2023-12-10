const { ARCHIVE_ROBOT } = require('../../config')

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
        AccessGroup: ARCHIVE_ROBOT.accessGroup,
        Archive: 'Elevdokument',
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
        ResponsiblePersonRecno: ARCHIVE_ROBOT.recno,
        ResponsibleEnterpriseNumber: '929882385', // fylkeskommune vfk (929882385) tfk (929882989)
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
