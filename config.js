module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  ARCHIVE_ROLE: process.env.ARCHIVE_ROLE || 'ein rolle som ikkje finnast',
  ARCHIVE: {
    url: process.env.ARCHIVE_URL || 'arkivarkivarkiv.vtfk.no',
    authkey: process.env.ARCHIVE_AUTHKEY || 'bluddiduddisusdii',
    clientId: process.env.ARCHIVE_CLIENT_ID || 'jujujuju'
  },
  ARCHIVE_ROBOT: {
    recno: process.env.ARCHIVE_ROBOT_RECNO || '12345',
    accessGroup: process.env.ARCHIVE_ROBOT_ACCESS_GROUP || 'VFK Robot',
    departmentRecno: process.env.ARCHIVE_ROBOT_DEPARTMENT || '200006'
  },
  ALLOW_LEGACY_RENEGOTIATION: (process.env.ALLOW_LEGACY_RENEGOTIATION && process.env.ALLOW_LEGACY_RENEGOTIATION === 'true') || false, // If you cant use tls1.2
  BRREG: {
    url: process.env.BRREG_URL || 'https://data.brreg.no/enhetsregisteret/api/enheter/',
    branchUrl: process.env.BRREG_BRANCH_URL || 'https://data.brreg.no/enhetsregisteret/api/underenheter/'
  },
  PDF_GENERATOR: {
    url: process.env.PDF_GENERATOR_URL,
    key: process.env.PDF_GENERATOR_KEY
  },
  MAIL: {
    cc: (process.env.MAIL_CC && process.env.MAIL_CC.split(',')) || false,
    bcc: (process.env.MAIL_BCC && process.env.MAIL_BCC.split(',')) || false,
    from: process.env.MAIL_FROM || 'noreply@vtfk.no',
    templateName: process.env.MAIL_TEMPLATE_NAME || 'vtfk',
    signature: {
      name: 'Arkiveringsroboten',
      title: '🚣',
      company: process.env.MAIL_COMPANY || 'Vestfold og Telemark fylkeskommune',
      phone: process.env.MAIL_PHONE || '35 91 70 00',
      mobile: process.env.MAIL_MOBILE || '35 91 70 00'
    },
    secret: process.env.MAIL_SECRET || false,
    toArchive: (process.env.MAIL_TO_ARCHIVE && process.env.MAIL_TO_ARCHIVE.split(',')) || [],
    toArchiveAdministrator: (process.env.MAIL_TO_ARCHIVE_ADMINISTRATOR && process.env.MAIL_TO_ARCHIVE_ADMINISTRATOR.split(',')) || [],
    toArchive7011: (process.env.MAIL_TO_ARCHIVE_7011 && process.env.MAIL_TO_ARCHIVE_7011.split(',')) || [],
    url: process.env.MAIL_URL
  },
  APPREG_CLIENT: {
    clientId: process.env.APPREG_CLIENT_ID ?? 'superId',
    clientSecret: process.env.APPREG_CLIENT_SECRET ?? 'hemmelig hemmelig',
    tenantId: process.env.APPREG_TENANT_ID ?? 'tenant id'
  },
  FREG: {
    url: process.env.FREG_URL || 'freg.freg.vtfk.no',
    scope: process.env.FREG_SCOPE || 'fregscupet'
  },
  FINTFOLK: {
    url: process.env.FINTFOLK_URL || 'fint.finttin.vtfk.no',
    scope: process.env.FINTFOLK_SCOPE || 'fregscupet'
  },
  ACCESSGROUP_EXCEPTIONS: (process.env.ACCESSGROUP_EXCEPTIONS && JSON.parse(process.env.ACCESSGROUP_EXCEPTIONS)) || {},
  GENERATED_PDF_PROPERTY_NAME: process.env.GENERATED_PDF_PROPERTY_NAME || 'templatePdfBase64',
  COUNTY_NUMBER: process.env.COUNTY_NUMBER || '38',
  DEV_SYNCEMPLOYEE_MANAGER: process.env.DEV_SYNCEMPLOYEE_MANAGER || false
}
