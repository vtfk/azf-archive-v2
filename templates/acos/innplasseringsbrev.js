const { GENERATED_PDF_PROPERTY_NAME } = require('../../config') // THIS LINE IS REQUIRED IF YOU NEED PDF GENERATION IN THE TEMPLATE
module.exports = {
  pdfTemplate: (pdfData) => {
    // A pdfTemplate adds GENERATED_PDF_PROPERTY_NAME-property to archiveData, which can be used in the archiveTemplate
    return {
      system: 'acos',
      template: 'innplasseringsbrev',
      language: 'nb',
      type: '2',
      version: 'B',
      data: {
        preview: false,
        timestamp: pdfData.timestamp,
        newSection: pdfData.newSection,
        newCounty: pdfData.newCounty,
        newManager: pdfData.newManager,
        employeeName: pdfData.employeeName,
        streetAddress: pdfData.streetAddress,
        zipCode: pdfData.zipCode,
        zipPlace: pdfData.zipPlace,
        sender: pdfData.sender,
        legalClaimDate: pdfData.legalClaimDate,
        newJobTitle: pdfData.newJobTitle,
        specialOfficeNeeds: pdfData.specialOfficeNeeds,
        specialOfficeNeedsDescription: pdfData.specialOfficeNeedsDescription
      }
    }
  },
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '25',
        AccessGroup: archiveData.accessGroup,
        Category: 'Dokument ut',
        Contacts: [
          {
            ReferenceNumber: archiveData.employeeSsn,
            Role: 'Mottaker',
            IsUnofficial: true
          }
        ],
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData[GENERATED_PDF_PROPERTY_NAME], // pdf created by the pdfTemplate (special case and not a required field - because the pdfTemplate handles it)
            Category: '1',
            Format: 'pdf',
            Status: 'F',
            Title: 'Innplasseringsbrev',
            VersionFormat: 'A'
          }
        ],
        Remarks: [
          {
            Title: `Innplasseringssamtalen ble ledet av: ${archiveData.responsibleName}`,
            RemarkType: 'ME'
          }
        ],
        Paragraph: 'Offl. § 25',
        ResponsibleEnterpriseNumber: archiveData.organizationNumber,
        ResponsiblePersonEmail: archiveData.managerUpn,
        Status: 'R',
        Title: 'Innplasseringsbrev',
        UnofficialTitle: `Innplasseringsbrev - ${archiveData.employeeName}`,
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber
      }
    }
  },
  requiredFields: {
    organizationNumber: '00000',
    documentDate: '2021-09-27',
    caseNumber: '30/00000',
    timestamp: '01.01.2024',
    newSection: 'Kontoravdelingen',
    newCounty: 'Vestfold',
    newManager: 'Sjefen til sjefen',
    employeeName: 'Ola Bredesen',
    streetAddress: 'Gata 4',
    zipCode: '2012',
    zipPlace: 'Plassen',
    sender: 'Toril',
    managerUpn: 'sjef.sjefesen@vtfk.no',
    responsibleName: 'Ansvarlig person',
    legalClaimDate: '07.01.2024',
    accessGroup: 'Tilgangsgruppa',
    employeeSsn: '0101197054445',
    newJobTitle: 'direktør',
    specialOfficeNeeds: 'Nei',
    specialOfficeNeedsDescription: 'Må ha cellekontor'
  }
}
