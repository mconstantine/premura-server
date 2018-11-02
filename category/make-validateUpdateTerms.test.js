const makeValidateUpdateTerms = require('./make-validateUpdateTerms')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateUpdateTerms', () => {
  it('Should validate category ID', () => {
    makeValidateUpdateTerms({ check })
    const call = getCheckCall('id')
    expect(call.isMongoId).toHaveBeenCalled()
  })

  it('Should validate terms', () => {
    makeValidateUpdateTerms({ check })
    const call = getCheckCall('terms')
    expect(call.isArray).toHaveBeenCalled()
  })

  it('Should validate terms IDs', () => {
    makeValidateUpdateTerms({ check })
    const call = getCheckCall('terms.*._id')
    expect(call.isMongoId).toHaveBeenCalled()
  })

  it('Should validate terms names', () => {
    makeValidateUpdateTerms({ check })
    const call = getCheckCall('terms.*.name')
    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
  })

  it('Should ensure that the user is not trying to update projects', () => {
    makeValidateUpdateTerms({ check })
    const call = getCheckCall('terms.*.projects')
    expect(call.not).toHaveBeenCalled()
    expect(call.exists).toHaveBeenCalled()
  })
})
