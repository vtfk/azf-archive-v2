const { repackFregAddress } = require("../lib/archive/sync-private-person")

const fregNoWorries = {
  "adressebeskyttelse": [], // Returns array - check if it includes "fortrolig" or "strengtFortrolig"
  "postadresse": { // Should always have value (contact us if it does not)
    "adressegradering": "ugradert",
    "gateadresse": "Stavangvegen 90",
    "postnummer": "6944",
    "poststed": "STAVANG",
    "landkode": "NO"
  },
}

const fregAddressBlockFortrolig = {
  "adressebeskyttelse": [], // Returns array - check if it includes "fortrolig" or "strengtFortrolig"
  "postadresse": { // Should always have value (contact us if it does not)
    "adressegradering": "fortrolig",
    "gateadresse": "Stavangvegen 90",
    "postnummer": "6944",
    "poststed": "STAVANG",
    "landkode": "NO"
  },
}

const fregAddressBlockKlientadresse = {
  "adressebeskyttelse": [], // Returns array - check if it includes "fortrolig" or "strengtFortrolig"
  "postadresse": { // Should always have value (contact us if it does not)
    "adressegradering": "klientadresse",
    "gateadresse": "Stavangvegen 90",
    "postnummer": "6944",
    "poststed": "STAVANG",
    "landkode": "NO"
  },
}

const fregAddressProtection = {
  "adressebeskyttelse": ['strengtFortrolig'], // Returns array - check if it includes "fortrolig" or "strengtFortrolig"
  "postadresse": { // Should always have value (contact us if it does not)
    "adressegradering": "ugradert",
    "gateadresse": "Stavangvegen 90",
    "postnummer": "6944",
    "poststed": "STAVANG",
    "landkode": "NO"
  },
}

const fregAddressProtectionAndBlock = {
  "adressebeskyttelse": ['fortrolig'], // Returns array - check if it includes "fortrolig" or "strengtFortrolig"
  "postadresse": { // Should always have value (contact us if it does not)
    "adressegradering": "fortrolig",
    "gateadresse": "Stavangvegen 90",
    "postnummer": "6944",
    "poststed": "STAVANG",
    "landkode": "NO"
  },
}

describe('Repack freg address works as expected when', () => {
  test('No address stuff is present', () => {
    const { address, addressProtection } = repackFregAddress(fregNoWorries)
    expect(address.streetAddress).toBe(fregNoWorries.postadresse.gateadresse)
    expect(addressProtection).toBe(false)
  })
  test('Address block fortrolig is present', () => {
    const { address, addressProtection } = repackFregAddress(fregAddressBlockFortrolig)
    expect(address.streetAddress).toBe(`Sperret adresse (fortrolig)`)
    expect(addressProtection).toBe(true)
  })
  test('Address block klientadresse is present', () => {
    const { address, addressProtection } = repackFregAddress(fregAddressBlockKlientadresse)
    expect(address.streetAddress).toBe(`Sperret adresse (klientadresse)`)
    expect(addressProtection).toBe(true)
  })
  test('Address protection is present', () => {
    const { address, addressProtection } = repackFregAddress(fregAddressProtection)
    expect(address.streetAddress).toBe(fregNoWorries.postadresse.gateadresse)
    expect(addressProtection).toBe(true)
  })
  test('Address protection and address block is present', () => {
    const { address, addressProtection } = repackFregAddress(fregAddressProtectionAndBlock)
    expect(address.streetAddress).toBe(`Sperret adresse (fortrolig)`)
    expect(addressProtection).toBe(true)
  })
})
