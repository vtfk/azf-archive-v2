const { NODE_ENV } = require('../../config')

module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessCodeDescription: 'Offl §13 jf. fvl §13 første ledd pkt. 1 - taushetsplikt om personlige forhold',
        AccessGroup: 'Fagopplæring',
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
            Title: 'Signert og godkjent lærekontrakt'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseRecno: NODE_ENV === 'production' ? '200016' : '200019', // Seksjon Fag- og yrkesopplæring (vfk) Team fag-, yrkes- og voksenopplæring (tfk) (vfk-test: 200019, vfk-prod: 200016) (tfk-test: 200249, tfk-prod: 200472)
        Status: 'J',
        Title: 'Signert og godkjent lærekontrakt',
        UnofficialTitle: `Signert og godkjent lærekontrakt - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    studentName: 'Bjarne Betjent',
    documentDate: '2021-09-27',
    base64: 'heihei'
  }
}
