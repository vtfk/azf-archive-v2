module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ContactService',
      method: 'SynchronizePrivatePerson',
      parameter: {
        FirstName: archiveData.firstName,
        LastName: archiveData.lastName,
        PersonalIdNumber: archiveData.ssn,
        Active: 'true',
        PrivateAddress: {
          StreetAddress: archiveData.streetAddress,
          ZipCode: archiveData.zipCode,
          ZipPlace: archiveData.zipPlace,
          Country: 'NOR'
        }
      }
    }
  },
  requiredFields: {
    firstName: 'Ola',
    lastName: 'Nordmann',
    ssn: '01010101010',
    streetAddress: 'Fiktivveien 42',
    zipCode: '4242',
    zipPlace: 'Fiktiviteten'
  }
}
