module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: archiveData.accessCode,
        AccessGroup: archiveData.accessGroup,
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber,
        Category: 'Dokument ut',
        DocumentDate: archiveData.date,
        Paragraph: archiveData.paragraph,
        ResponsiblePersonEmail: archiveData.responsiblePersonEmail,
        Status: 'R',
        Title: archiveData.title,
        UnofficialTitle: archiveData.title
      }
    }
  },
  requiredFields: {
    accessGroup: 'Elev vgs',
    accessCode: 'U',
    caseNumber: '30/00000',
    date: '2021-09-27',
    title: 'Saken om kjeks',
    responsiblePersonEmail: 'kjell.t.ring@vtfk.no',
    paragraph: 'Ingen paragraf gitt'
  }
}
