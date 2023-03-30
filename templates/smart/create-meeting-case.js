module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'CaseService',
      method: 'CreateCase',
      parameter: {
        CaseType: 'Sak',
        Project: archiveData.projectNumber,
        Title: `Møtereferat - ${archiveData.title} - ${archiveData.moteDato}`,
        UnofficialTitle: `Møtereferat - ${archiveData.title} - ${archiveData.moteDato}`,
        Status: 'B',
        JournalUnit: 'Sentralarkiv',
        SubArchive: 'Sakarkiv',
        ArchiveCodes: [
          {
            ArchiveCode: '035',
            ArchiveType: 'FELLESKLASSE PRINSIPP',
            Sort: 1,
            IsManualText: true
          }
        ],
        FiledOnPaper: false,
        ResponsibleEnterpriseRecno: archiveData.responsibleEnterpriseRecno,
        ResponsiblePersonRecno: archiveData.responsiblePersonRecno
      }
    }
  },
  requiredFields: {
    title: 'Hei',
    projectNumber: '23-2',
    moteDato: '2022-11-10',
    responsibleEnterpriseRecno: '23455',
    responsiblePersonRecno: '2345'
  }
}
