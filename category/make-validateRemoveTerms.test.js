const makeValidateRemoveTerms = require('./make-validateRemoveTerms')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateRemoveTerms', () => {
  it('Should validate category ID', () => {
    makeValidateRemoveTerms({ check })
    const call = getCheckCall('id')
    expect(call.isMongoId).toHaveBeenCalled()
  })

  it('Should validate terms', () => {
    makeValidateRemoveTerms({ check })
    const call = getCheckCall('terms')
    expect(call.isArray).toHaveBeenCalled()
  })

  it('Should validate terms IDs', () => {
    makeValidateRemoveTerms({ check })
    const call = getCheckCall('terms.*._id')
    expect(call.isMongoId).toHaveBeenCalled()
  })
})
