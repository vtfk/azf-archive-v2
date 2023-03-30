module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'ContactService',
      method: 'UpdatePrivatePerson',
      parameter: {
        Recno: archiveData.recno,
        FirstName: archiveData.firstName,
        LastName: archiveData.lastName,
        PersonalIdNumber: archiveData.ssn,
        ExternalID: '',
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
    recno: '12345',
    firstName: 'Ola',
    lastName: 'Nordmann',
    ssn: '01010101010',
    streetAddress: 'Fiktivveien 42',
    zipCode: '4242',
    zipPlace: 'Fiktiviteten'
  }
}
