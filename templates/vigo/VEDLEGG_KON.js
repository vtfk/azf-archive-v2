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
            Format: archiveData.fileExt,
            VersionFormat: archiveData.fileExt.toLowerCase() === 'pdf' ? 'P' : null,
            Status: 'F',
            Title: 'Vedlegg til lærekontrakt'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsiblePersonRecno: '200065', // Seksjon for fag- og yrkesopplæring
        ResponsibleEnterpriseRecno: '200065', // Seksjon for fag- og yrkesopplæring
        Status: 'J',
        Title: 'Vedlegg til lærekontrakt',
        UnofficialTitle: `Vedlegg til lærekontrakt - ${archiveData.studentName}`
      }
    }
  },
  requiredFields: {
    caseNumber: '30/00000',
    ssn: '01010101010',
    documentDate: '2021-09-27',
    base64: 'heihei',
    fileExt: 'pdf',
    studentName: 'Bjarne Betjent'
  }
}
