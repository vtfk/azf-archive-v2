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
            Title: `Søknad til videregående opplæring - skoleåret ${currentYear}/${nextYear}`
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsiblePersonRecno: ARCHIVE_ROBOT.recno, // Robot
        ResponsibleEnterpriseNumber: '929882385', // fylkeskommune vfk (929882385) tfk (929882989)
        Status: 'J',
        Title: `Søknad til videregående opplæring - skoleåret ${currentYear}/${nextYear}`,
        UnofficialTitle: `Søknad til videregående opplæring - skoleåret ${currentYear}/${nextYear} - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    studentName: 'Bjartmar Tjorven',
    documentDate: '2021-09-27',
    base64: 'heihei'
  }
}
