# azf-archive

Azure function for archive operations in P360

## API

All calls needs a valid Azure AD access token

### ```POST /archive - template```

Endpoint for template calls. See [here](#templates) for a complete list of templates

Required fields:
- `system`: Which ***system*** to use
- `template`: Which ***template*** to use
- `parameter`: Parameters for calling ***P360***

Optional fields:
- `demoRun`: If set to true, does not archive, but instead returns the generated payload for the template
- `getExample`: If set to true, does not archive, returns a sample payload with the required parameters for the template
- `parameter.attachments`: List of ***attachments*** to add to P360 Document when using templates with methods 'CreateDocument' or 'UpdateDocument' **NOTE** If the documents does not have any files - the first attachment in this list will become `Hoveddokument` for the document!
- `parameter.contacts`: List of ***contacts*** to add to P360 Project, Case, or Document when using templates with methods 'CreateProject', 'UpdateProject', 'CreateCase', 'UpdateCase', 'CreateDocument', or 'UpdateDocument'

```json
{
  "system": "iop",
  "template": "document",
  "parameter": {
    "accessGroup": "Elev vgs",
    "organizationNumber": "01234",
    "ssn": "01010101010",
    "base64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
    "fileFormat": "pdf",
    "displayName": "Bjarne Betjent",
    "caseNumber": "30/99999",
    "documentDate": "2021-09-27",
    "versionNumber": "4.0"
  }
}
```
#### `Sending to "unregistered" - for manual archiving`
Useful for when you do not have sufficient data for automatic archiving (e.g. foreign students not registered in DSF/folkeregister)
```json
{
  "system": "archive",
  "template": "unregistered",
  "parameter": {
    "title": "A title that describes the document",
    "msg": "A message to the archivists, on why this could not be automatically be archived (keep it short)", 
    "base64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
    "originRecno": "200007" // "200007" is displayed as source "Arkiveringsrobot" for archivists - if you need something else - ask an adult
  }
}
```

#### `With attachments and/or contacts, and demoRun, getExample and archive`

```json
{
  "demoRun": true, // Optional
  "getExample": true, // Optional
  "system": "iop",
  "template": "document",
  "parameter": {
    "accessGroup": "Elev vgs",
    "organizationNumber": "01234",
    "ssn": "01010101010",
    "base64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
    "fileFormat": "pdf",
    "displayName": "Bjarne Betjent",
    "caseNumber": "30/99999",
    "documentDate": "2021-09-27",
    "versionNumber": "4.0",
    "attachments": [ // Optional
      {
        "title": "Et vedlegg",
        "format": "docx",
        "base64": "base64-representation of the file"
      },
      {
        "title": "Enda et vedlegg",
        "format": "msg",
        "base64": "base64-representation of the file"
      }
    ],
    "contacts": [ // Optional
      {
        "ssn": "01010101011", // Valid property names are: "ssn", "orgnr", "externalId", "privatePersonRecno", "enterpriseRecno", or "contactPersonRecno" 
        "role": "Mottaker",
        "isUnofficial": true // Can be true, false, or undefined (undefined => false)
      },
      {
        "orgnr": "12345678",
        "role": "Avsender"
      }
      {
        "externalID": "78787",
        "role": "Avsender",
        "isUnofficial": false
      },
      {
        "privatePersonRecno": "123456",
        "role": "Avsender"
      },
      {
        "enterpriseRecno": "123556",
        "role": "Avsender"
      },
      {
        "contactPersonRecno": "133556",
        "role": "Kopimottaker"
      }
    ]
  }
}
```

### ```POST /archive - raw```

Endpoint for raw SIF calls

Required fields:
- `service`: Which ***SIF service*** to use
- `method`: Which ***method*** from ***SIF service*** to use
- `parameter`: Parameters for calling ***service.method***


Example
```json
{
  "service": "CaseService",
  "method": "GetCases",
  "parameter": {
    "CaseNumber": "23/29876"
  }
}
```

#### `Ping`

All services have a Ping-method. Ping only returns status-code and no body.

Example
```json
{
  "service": "CaseService",
  "method": "Ping",
  "parameter": {}
}
```
Returns 200 OK (if ok 🙃)


### SIF documentation

Latest **SIF documentation** as well as **release notes** can be found [here](https://help.360online.com/Release_information/Index.html#!Documents/additionalinformationandresources.htm)

### ```POST /SyncPrivatePerson```
- Creates **PrivatePerson** on person if one doesn't exist on given identifier, updates the existing PrivatePerson if "forceUpdate" is true. Returns the privatePerson.

If needed, fetches person info from [Folkeregisteret](https://github.com/vtfk/azf-freg)

#### `With ssn as parameter`
```json
{
  "ssn": "01010101010"
}
```

#### `With birthdate and name as parameter (only works with one match)`
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son"
}
```

#### `With fakeSsn as parameter`
Either uses the **PrivatePerson** with the provided data if person exists on the fake ssn AND the lastname of the existing 360-contact and the input-lastname matches, or creates new **PrivatePerson** with the provided data. The fake ssn is generated automatically based on the birthdate and gender. Address info is also required when using fake ssn. Fake ssn is generated in the following format: {birthdate (on the format {DD+40}MMYY)}{serial number}{gender (m = 1, f = 2)}{countyNumber}. E.g the example below will result in 67022199238 (if countyNumber is 38)

```json
{
  "fakeSsn": true,
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "gender": "f", // "m" or "f"
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter"
}
```
#### `Optional: Use manually provided data instead of FREG data)`
Either updates the **PrivatePerson** with FREG data if person exists on identifier, or creates new **PrivatePerson** with the provided data
```json
{
  "ssn": "12345678910",
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "manualData": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "manualData": true
}
```

#### `Optional: Force update of PrivatePerson even if it alreday exists (if you want to make sure it is updated with latest or provided data)`
Either updates the **PrivatePerson** with FREG data if person exists on identifier, or creates new **PrivatePerson** with the provided data
```json
{
  "ssn": "12345678910",
  "forceUpdate": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "forceUpdate": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "gender": "f", // "m" or "f"
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "forceUpdate": true
}
```
```json
{
  "ssn": "12345678910",
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "forceUpdate": true,
  "manualData": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "forceUpdate": true,
  "manualData": true
}
```

### ```POST /SyncEnterprise```
- Create **Enterprise** on Brreg-company if one doesn't exist
- Updates data on **Enterprise** if one already exists

#### `Payload`
```json
{
  "orgnr": "123456789"
}
```

Fetches company info from [Brønnøysundregisteret]https://www.brreg.no/)


### ```POST /SyncElevmappe```
- Creates **PrivatePerson** on person if one doesn't exist on given identifier, updates the existing PrivatePerson if "forceUpdate" is true.
- Creates **Elevmappe** on person if elevmappe doesn't exist on given PrivatePerson, updates the Elevmappe if it does not match name or address info on contact. Returns 

If needed, fetches person info from [Folkeregisteret](https://github.com/vtfk/azf-freg)

#### `With ssn as parameter`
```json
{
  "ssn": "01010101010"
}
```

#### `With birthdate and name as parameter (only works with one match)`
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son"
}
```

#### `With fakeSsn as parameter`
Either uses the **PrivatePerson** with the provided data if person exists on the fake ssn AND the lastname of the existing 360-contact and the input-lastname matches, or creates new **PrivatePerson** with the provided data. The fake ssn is generated automatically based on the birthdate and gender. Address info is also required when using fake ssn. Fake ssn is generated in the following format: {birthdate (on the format {DD+40}MMYY)}{serial number}{gender (m = 1, f = 2)}{countyNumber}. E.g the example below will result in 67022199238 (if countyNumber is 38)

```json
{
  "fakeSsn": true,
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "gender": "f", // "m" or "f"
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter"
}
```
#### `Optional: Use manually provided data instead of FREG data)`
Either updates the **PrivatePerson** with FREG data if person exists on identifier, or creates new **PrivatePerson** with the provided data
```json
{
  "ssn": "12345678910",
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "manualData": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "manualData": true
}
```

#### `Optional: Force update of PrivatePerson even if it alreday exists (if you want to make sure it is updated with latest or provided data)`
Either updates the **PrivatePerson** with FREG data if person exists on identifier, or creates new **PrivatePerson** with the provided data
```json
{
  "ssn": "12345678910",
  "forceUpdate": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "forceUpdate": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "gender": "f", // "m" or "f"
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "forceUpdate": true
}
```
```json
{
  "ssn": "12345678910",
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "forceUpdate": true,
  "manualData": true
}
```
```json
{
  "birthdate": "2021-02-27", // YYYY-MM-DD
  "name": "Per Son", // Either name, or firstName and lastName
  "firstName": "Per",
  "lastName": "Son",
  "streetAddress": "Gamlehjemmet 44",
  "zipCode": "1234",
  "zipPlace": "Jupiter",
  "forceUpdate": true,
  "manualData": true
}
```

### ```POST /SyncEmployee```
- Creates **PrivatePerson** on person if one doesn't exist on given identifier, updates the existing PrivatePerson if "forceUpdate" is true.
- Fetches **responsibleEnterprise** and **archiveManager** for the privateperson/employee. If enterprise from HR is not found in archive - moves one level up and tries to find that instead. 

Fetches person info from [FINTFOLK-API](https://github.com/vtfk/azf-fintfolk-api)

#### `With ssn as parameter`
```json
{
  "ssn": "01010101010"
}
```

#### `With ansattnummer as parameter`
```json
{
  "ssn": "01010101010"
}
```

#### `With upn as parameter` **NOTE: should not be used until all employees are in the same tenant**
```json
{
  "upn": "user.name@domain.com"
}
```

#### Returns
```json
{
	"privatePerson": {
		"ssn": "12345678910",
		"name": "Shrek Sump",
		"firstName": "Shrek",
		"lastName": "Sump",
		"streetAddress": "Sumpen 1",
		"zipCode": "1234",
		"zipPlace": "Drømmeland",
		"addressProtection": false,
		"recno": 200451,
		"updated": false,
		"created": false
	},
	"archiveManager": {
		"recno": 200931,
		"email": "grev.farquaad@shrektek.no",
		"name": "Grev Farquaad"
	},
	"responsibleEnterprise": {
		"recno": 200103,
		"externalId": "3201",
		"shortName": "SHREK-TEK",
		"name": "Team Shrek-tek"
	}
}
```

### ```POST /SyncSharePointSite```
Endpoint for connecting a Sharepoint site to a archive-project, and a list || documentLibrary || folder to a archive-case

The Sharepoint site is connected to a archive-projectNumber. The list || documentLibrary || folder is connected to a archive case through the archive-field **externalId**

- Creates **Project** in archive if parameter `projectNumber` is not provided, or set to the string 'nei'.
- Creates **Case** in archive if the Sharepoint-id of the list || documentLibrary || folder does not exist as externalId in archive - or fetches the caseNumber if it exists.
- Does **not** update case or project metadata in archive. This is for avoiding conflicting changes if archivists change metadata directly in archive.
- If project exists - new case will inherit responsible person from the project, even if you specify a different responsible person this in the payload. This is for avoiding conflicting changes if archivists change metadata directly in archive.
- Returns metadata on **Project** and **Case** from archive


#### `Example payload`
```json
{
  "siteUrl": "https://<domain>.sharepoint.com/sites/<site-name>",
  "projectNumber": "{existing project number} || ${'nei'} || ${undefined}", // Undefined and 'nei' creates new project in archive
  "projectTitle": "Something that describes the Sharepoint site",
  "responsiblePersonEmail": "person@domain.com", // Must have access to archive - will throw error if user email is not found on a user in archive
  "caseExternalId": "{siteUrl}-{type}-{guid}", // TODO: decide common structure - externalId MUST be unique
  "caseTitle": "Something that describes the list || documentLibrary || folder",
  "accessGroup": "Elev gul skole", // OPTIONAL. Defaults to "Alle"
  "paragraph": "Offntl. 13.3" // OPTIONAL. Defaults to ""
}
```
#### `Response`
```json
{
  "msg": "Succesfully synced SharePointSite",
  "projectNumber": "24-1",
  "projectTitle": "Bygging av nye fylkeskommuner",
  "caseNumber": "22/00013",
  "caseTitle": "Arkivering fra Sharepoint til P360"
}
```

## Templates
All templates are found in [the templates folder](./templates/) 


## local.settings.json

```json
{
    "IsEncrypted": false,
    "Values": {
      "AzureWebJobsStorage": "",
      "FUNCTIONS_WORKER_RUNTIME": "node",
      "ALLOW_LEGACY_RENEGOTIATION": false,
      "ARCHIVE_ROLE": "Archive",
      "ARCHIVE_URL": "sif rpc url",
      "ARCHIVE_CLIENT_ID": "sif client id",
      "ARCHIVE_AUTHKEY": "sif authkey",
      "ARCHIVE_ROBOT_RECNO": "recno of robot in p360, used as responsible on elevmapper",
      "ARCHIVE_ROBOT_ACCESS_GROUP": "robot access group, used on elevmapper",
      "PDF_GENERATOR_URL": "url to pdf api",
      "PDF_GENERATOR_KEY": "key for pdf api",
      "MAIL_TO_ARCHIVE": "mail address to archive team",
      "MAIL_TO_ARCHIVE_7011": "mail address to archive hr team",
      "MAIL_TO_ARCHIVE_ADMINISTRATOR": "mail address to archive administrator",
      "MAIL_SECRET": "key for mail api",
      "MAIL_URL": "url to mail api",
      "MAIL_MOBILE": "signature mobile number for emails",
      "MAIL_PHONE": "signature phpne number for emails",
      "MAIL_COMPANY": "signature company for emails",
      "MAIL_TEMPLATE_NAME": "mail template",
      "APPREG_CLIENT_ID": "client id of app reg representing this function",
      "APPREG_CLIENT_SECRET": "client secret",
      "APPREG_TENANT_ID": "tenant id",
      "GRAPH_SCOPE": "https://graph.microsoft.com/.default",
      "FINTFOLK_URL": "fdfjkdlfd.no",
      "FINTFOLK_SCOPE": "fjdifjdif",
      "FREG_URL": "url to freg api",
      "FREG_SCOPE": "scope for freg api",
      "BRREG_URL": "url to brreg api",
      "ACCESSGROUP_EXCEPTIONS": "spør en voksen",
      "COUNTY_NUMBER": "fylkesnummer"
    }
}
```

## Deploy

### Azure

You'll need a valid subscription and to setup the following resources

- resource group
- app service plan
- storage account
- function app
  - auth enabled with entra id
- app registration

# Development

Install all tools needed for [local development](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-local).

Clone the repo. Install dependencies (```npm install```)

Create a [local.settings.json](#local.settings.json) file

Start server

```
$ func start
```

# License

[MIT](LICENSE)
