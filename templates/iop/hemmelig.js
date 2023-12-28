const { GENERATED_PDF_PROPERTY_NAME } = require('../../config') // THIS LINE IS REQUIRED IF YOU NEED PDF GENERATION IN THE TEMPLATE
module.exports = {
  pdfTemplate: (pdfData) => {
    // A pdfTemplate adds GENERATED_PDF_PROPERTY_NAME-property to archiveData, which can be used in the archiveTemplate
    return {
      system: 'iop',
      template: 'hemmelig',
      language: 'nb',
      type: '2',
      version: 'B',
      data: {
        created: {
          timestamp: new Date().getTime()
        },
        student: {
          name: pdfData.student.name,
          classId: pdfData.student.classId
        },
        teacher: {
          name: pdfData.teacher.name
        },
        school: {
          name: pdfData.school.name
        }
      }
    }
  },
  archiveTemplate: (archiveData) => {
    return {
      service: 'DocumentService',
      method: 'CreateDocument',
      parameter: {
        AccessCode: '13',
        AccessGroup: 'VTFK Robot',
        Category: 'Internt notat med oppfølging',
        Contacts: [
          {
            ReferenceNumber: archiveData.organizationNumber,
            Role: 'Avsender'
          },
          {
            ReferenceNumber: archiveData.organizationNumber,
            Role: 'Mottaker'
          }
        ],
        DocumentDate: archiveData.documentDate,
        Files: [
          {
            Base64Data: archiveData[GENERATED_PDF_PROPERTY_NAME], // pdf created by the pdfTemplate (special case and not a required field - because the pdfTemplate handles it)
            Category: '1',
            Format: 'pdf',
            Status: 'F',
            Title: `Individuell opplæringsplan ${archiveData.documentNumber}, må skrives ut og leveres til elev`,
            VersionFormat: 'A'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseNumber: archiveData.organizationNumber,
        Status: 'J',
        Title: 'Individuell opplæringsplan archiveData.documentNumber, må skrives ut og leveres til elev',
        UnofficialTitle: `Individuell opplæringsplan ${archiveData.documentNumber}, må skrives ut og leveres til elev - ${archiveData.student.name}`,
        Archive: 'Saksdokument',
        CaseNumber: archiveData.caseNumber
      }
    }
  },
  requiredFields: {
    organizationNumber: '00000',
    documentDate: '2021-09-27',
    documentNumber: '30/00000-12',
    student: {
      name: 'Ola Nordmann',
      classId: 'GUL:5OPP'
    },
    teacher: {
      name: 'Kari Nordmann'
    },
    school: {
      name: 'Gul vgs'
    },
    caseNumber: '30/00000'
  }
}
