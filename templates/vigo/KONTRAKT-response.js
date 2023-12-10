const { GENERATED_PDF_PROPERTY_NAME, NODE_ENV } = require('../../config') // GENERATED_PDF_PROPERTY_NAME IS REQUIRED IF YOU NEED PDF GENERATION IN THE TEMPLATE

module.exports = {
  pdfTemplate: (pdfData) => {
    // A pdfTemplate adds GENERATED_PDF_PROPERTY_NAME-property to archiveData, which can be used in the archiveTemplate
    return {
      system: 'vigo',
      template: 'KONTRAKT-response',
      language: 'nb',
      type: '2',
      version: 'B',
      data: {
        created: {
          timestamp: new Date().getTime()
        },
        studentName: pdfData.studentName,
        streetAddress: pdfData.streetAddress,
        zipCode: pdfData.zipCode,
        zipPlace: pdfData.zipPlace,
        department: 'Seksjon Fag- og yrkesopplæring' // Telemark => Team fag-, yrkes- og voksenopplæring
      }
    }
  },
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessGroup: 'Fagopplæring',
        Archive: 'Elevdokument',
        Category: 'Dokument ut',
        Contacts: [
          {
            ReferenceNumber: NODE_ENV === 'production' ? 'recno:200016' : 'recno:200019', // Seksjon Fag- og yrkesopplæring (vfk) Team fag-, yrkes- og voksenopplæring (tfk) (vfk-test: 200019, vfk-prod: 200016) (tfk-test: 200249, tfk-prod: 200472)
            Role: 'Avsender'
          },
          {
            IsUnofficial: true,
            ReferenceNumber: archiveData.ssn,
            Role: 'Mottaker'
          }
        ],
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData[GENERATED_PDF_PROPERTY_NAME],
            Category: '1',
            Format: 'pdf',
            Status: 'F',
            Title: 'Informasjonsbrev ved godkjent kontrakt',
            VersionFormat: 'A'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseRecno: NODE_ENV === 'production' ? '200016' : '200019', // Seksjon Fag- og yrkesopplæring (vfk) Team fag-, yrkes- og voksenopplæring (tfk) (vfk-test: 200019, vfk-prod: 200016) (tfk-test: 200249, tfk-prod: 200472)
        Status: 'R',
        Title: 'Informasjonsbrev ved godkjent kontrakt',
        UnofficialTitle: `Informasjonsbrev ved godkjent kontrakt - ${archiveData.studentName}`,
        CaseNumber: archiveData.caseNumber
      }
    }
  },
  requiredFields: {
    ssn: '12345678910',
    studentName: '00000',
    streetAddress: 'Nedre Gulevei 2',
    zipCode: '3134',
    zipPlace: 'Kebab',
    documentDate: '2021-09-27',
    caseNumber: '30/00000'
  }
}
