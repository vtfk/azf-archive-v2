module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ProjectService',
      method: 'CreateProject',
      parameter: {
        Title: `Personaldokumentasjon - ${archiveData.firstName} ${archiveData.lastName}`,
        AccessGroup: 'Alle',
        ResponsiblePersonEmail: archiveData.managerEmail,
        Contacts: [
          {
            Role: 'Kontakt',
            ReferenceNumber: archiveData.ssn
          }
        ]
      }
    }
  },
  requiredFields: {
    firstName: 'Ola',
    lastName: 'Nordmann',
    ssn: '01010101010',
    managerEmail: 'sjef@sjefen.no'
  }
}
