module.exports = {
  RAW_ROLE: process.env.RAW_ROLE || 'ein rolle som ikkje finnast',
  DEFAULT_ARCHIVE: process.env.DEFAULT_ARCHIVE || 'det arkivet du skal bruke mest',
  ARCHIVES: [
    {
      name: 'VTFK',
      url: process.env.VTFK_ARCHIVE_URL || 'arkivarkivarkiv.vtfk.no',
      authkey: process.env.VTFK_ARCHIVE_AUTHKEY || 'bluddiduddisusdii',
      authType: process.env.VTFK_ARCHIVE_AUTHTYPE || 'anonononoymous'
    }
  ],
  ALLOW_LEGACY_RENEGOTIATION: (process.env.ALLOW_LEGACY_RENEGOTIATION && process.env.ALLOW_LEGACY_RENEGOTIATION === 'true') || false,
  BRREG: {
    url: process.env.BRREG_URL || 'https://data.brreg.no/enhetsregisteret/api/enheter/',
    branchUrl: process.env.BRREG_BRANCH_URL || 'https://data.brreg.no/enhetsregisteret/api/underenheter/'
  },
  PDF_GENERATOR: {
    url: process.env.PDF_GENERATOR
  },
  MAIL: {
    cc: (process.env.MAIL_CC && process.env.MAIL_CC.split(',')) || false,
    bcc: (process.env.MAIL_BCC && process.env.MAIL_BCC.split(',')) || false,
    from: process.env.MAIL_FROM || 'noreply@vtfk.no',
    signature: {
      name: 'Arkiveringsroboten',
      title: '🚣',
      company: 'Vestfold og Telemark fylkeskommune',
      phone: '35 91 70 00',
      mobile: '35 91 70 00'
    },
    secret: process.env.MAIL_SECRET || false,
    toArchive: (process.env.MAIL_TO_ARCHIVE && process.env.MAIL_TO_ARCHIVE.split(',')) || [],
    toArchiveAdministrator: (process.env.MAIL_TO_ARCHIVE_ADMINISTRATOR && process.env.MAIL_TO_ARCHIVE_ADMINISTRATOR.split(',')) || [],
    toArchive7011: (process.env.MAIL_TO_ARCHIVE_7011 && process.env.MAIL_TO_ARCHIVE_7011.split(',')) || [],
    url: process.env.MAIL_URL
  },
  VIEW_PERMISSION: {
    excludeSchools: ['Elev fagskolen', 'Elev skolen for sosiale og medisinske institusjoner', 'Elev Kompetansebyggeren'],
    excludeEnterprises: ['Seksjon for pedagogisk psykologisk tjeneste', 'Seksjon for oppfølgingstjeneste']
  },
  GRAPH_CLIENT: {
    clientId: process.env.GRAPH_CLIENT_ID ?? 'superId',
    clientSecret: process.env.GRAPH_CLIENT_SECRET ?? 'hemmelig hemmelig',
    tenantId: process.env.GRAPH_TENANT_ID ?? 'tenant id',
    scope: process.env.GRAPH_SCOPE ?? 'etSkikkeligSkuup'
  },
  ACCESSGROUP_EXCEPTIONS: (process.env.ACCESSGROUP_EXCEPTIONS && JSON.parse(process.env.ACCESSGROUP_EXCEPTIONS)) || {},
  GENERATED_PDF_PROPERTY_NAME: process.env.GENERATED_PDF_PROPERTY_NAME || 'templatePdfBase64'
}
