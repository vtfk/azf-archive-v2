module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ProjectService',
      method: 'CreateProject',
      parameter: {
        Title: archiveData.projectTitle,
        ResponsiblePersonEmail: archiveData.responsiblePersonEmail
      }
    }
  },
  requiredFields: {
    projectTitle: 'Test prosjekt-tittel',
    responsiblePersonEmail: 'Nordmann@no.no'
  }
}
