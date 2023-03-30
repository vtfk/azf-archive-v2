module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ProjectService',
      method: 'GetProjects',
      parameter: {
        ProjectNumber: archiveData.projectNumber
      },
      options: {
        limit: 1
      }
    }
  },
  requiredFields: {
    projectNumber: '23-12'
  }
}
