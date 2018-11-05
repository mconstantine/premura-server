const makeValidateAddTerms = require('./make-validateAddTerms')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateAddTerms', () => {
  it('Should validate id', () => {
    makeValidateAddTerms({ check })
    const call = getCheckCall('id')

    expect(call.isMongoId).toHaveBeenCalled()
  })

  it('Should validate terms', () => {
    makeValidateAddTerms({ check })
    const call = getCheckCall('terms')

    expect(call.isArray).toHaveBeenCalled()
  })

  it('Should validate terms names', () => {
    makeValidateAddTerms({ check })
    const call = getCheckCall('terms.*.name')

    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })
})
