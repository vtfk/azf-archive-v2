module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'CaseService',
      method: 'CreateCase',
      parameter: {
        CaseType: 'Elev',
        Title: 'Elevmappe',
        UnofficialTitle: `Elevmappe - ${archiveData.firstName} ${archiveData.lastName}`,
        Status: 'B',
        JournalUnit: 'Sentralarkiv',
        SubArchive: '4',
        ArchiveCodes: [
          {
            ArchiveCode: archiveData.ssn,
            ArchiveType: 'FNR',
            Sort: 1,
            IsManualText: true
          },
          {
            ArchiveCode: 'B31',
            ArchiveType: 'FAGKLASSE PRINSIPP',
            Sort: 2,
            IsManualText: true
          }
        ],
        FiledOnPaper: false,
        AccessCode: '13',
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        AccessGroup: 'VTFK Robot',
        ResponsibleEnterpriseRecno: 506,
        ResponsiblePersonRecno: archiveData.robotRecno,
        Contacts: [
          {
            Role: 'Sakspart',
            ReferenceNumber: archiveData.ssn,
            IsUnofficial: true
          }
        ]
      }
    }
  },
  requiredFields: {
    firstName: 'Ola',
    lastName: 'Nordmann',
    ssn: '01010101010',
    robotRecno: '200326'
  }
}
