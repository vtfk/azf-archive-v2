module.exports = {
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        Archive: '7',
        Title: archiveData.title,
        DocumentDate: '2019-10-09T06:46:05.952Z',
        Category: 'I',
        Status: 'J',
        AccessCode: '',
        AccessGroup: 'Alle',
        UnregisteredContacts: [
          {
            Role: '5',
            ContactName: archiveData.msg
          }
        ],
        JournalDate: '2019-10-09T06:46:05.952Z',
        DispatchedDate: '2019-10-09T06:46:05.952Z',
        Files: [
          {
            Title: archiveData.title,
            Format: 'pdf',
            Base64Data: archiveData.base64
          }
        ],
        AdditionalFields: [
          {
            Name: 'Committed',
            Value: '-1'
          },
          {
            Name: 'ToOrigin',
            Value: archiveData.originRecno || '200007'
          }
        ]
      }
    }
  },
  requiredFields: {
    title: 'En kul tittel',
    msg: 'En fin beskrivende beskjed til arkiv, om hvorfor vi ikke fikk til å arkivere automatisk',
    base64: 'heihei'
  }
}
