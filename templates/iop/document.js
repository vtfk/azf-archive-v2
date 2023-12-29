module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessCodeDescription: 'Offl §13 jf. fvl §13 første ledd pkt. 1 - taushetsplikt om personlige forhold',
        AccessGroup: archiveData.accessGroup,
        Archive: 'Elevdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Dokument ut',
        Contacts: [
          {
            IsUnofficial: false,
            ReferenceNumber: archiveData.organizationNumber,
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
            Base64Data: archiveData.base64,
            Category: '1',
            Format: archiveData.fileFormat,
            Status: 'F',
            Title: `${archiveData.titleType} - Individuell opplæringsplan`,
            VersionFormat: 'P'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseNumber: archiveData.organizationNumber,
        Status: 'R',
        Title: `${archiveData.titleType} - Individuell opplæringsplan`,
        UnofficialTitle: `${archiveData.titleType} - Individuell opplæringsplan - ${archiveData.displayName} - versjon ${archiveData.versionNumber}`
      }
    }
  },
  requiredFields: {
    accessGroup: 'Elev vgs',
    caseNumber: '30/00000',
    organizationNumber: '00000',
    ssn: '01010101010',
    documentDate: '2021-09-27',
    base64: 'heihei',
    fileFormat: 'pdf',
    displayName: 'Ola Nordmann',
    versionNumber: '4.1',
    titleType: 'IOP | Halvårsrapport IOP | Årsrapport IOP'
  }
}
