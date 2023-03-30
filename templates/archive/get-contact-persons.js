module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ContactService',
      method: 'GetContactPersons',
      parameter: {
        Email: archiveData.email,
        Active: 'true'
      }
    }
  },
  requiredFields: {
    email: 'hubbabubba@hubben.com'
  }
}
