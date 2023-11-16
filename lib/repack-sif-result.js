const hasSifError = response => {
  if (Object.prototype.hasOwnProperty.call(response, 'Successful') && !response.Successful) return true
  if (Object.prototype.hasOwnProperty.call(response, 'ErrorMessage') && typeof response.ErrorMessage === 'string' && response.ErrorMessage.trim().length > 0 && response.ErrorMessage !== '\n') return true
  return false
}
const repackUglySifError = response => {
  response.ErrorMessage = (response.ErrorMessage && typeof response.ErrorMessage === 'string' && response.ErrorMessage.includes('Exception:')) ? response.ErrorMessage.split('Exception:')[1].split('<operation>')[0] : response.ErrorMessage
  response.ErrorMessage = response.ErrorMessage.replace(/\\"/g, '').replace(/'/g, '').replace(/"/g, '').replace(/"/g, '`').trim()
  return response
}

const repackSifResult = (sifResult, options) => {
  const removeProperties = [
    'ErrorDetails',
    'ErrorMessage',
    'Successful',
    'TotalCount',
    'TotalPageCount'
  ]
  for (const key of Object.keys(sifResult)) {
    if (removeProperties.includes(key)) delete sifResult[key]
  }
  if (Object.keys(sifResult).length > 1) {
    return sifResult
  }
  if (Object.keys(sifResult).length === 0) {
    return null
  }
  // Result has only one property and thus one value

  let result = Object.values(sifResult)[0]

  // Only open or exclude expired Cases Option
  if (options?.onlyOpenCases) {
    result = result.filter(({ Status }) => Status === 'Under behandling')
  } else if (options?.excludeExpiredCases) {
    result = result.filter(({ Status }) => Status !== 'Utgår')
  }
  // Limit options
  if (options?.limit === 1) {
    if (Array.isArray(result) && result.length > 0) {
      return result[0]
    } else if (Array.isArray(result) && result.length === 0) {
      return null
    } else {
      return result
    }
  } else if (options?.limit > 1) {
    if (Array.isArray(result)) {
      return result.slice(0, options.limit)
    } else {
      return result
    }
  } else {
    return result
  }
}

module.exports = { hasSifError, repackUglySifError, repackSifResult }
