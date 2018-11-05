const makeValidateUpdateCategory = require('./make-validateUpdateCategory')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateUpdateCategory', () => {
  it('Should validate id', () => {
    makeValidateUpdateCategory({ check })
    const call = getCheckCall('id')
    expect(call.isMongoId).toHaveBeenCalled()
  })

  it('Should validate name', () => {
    makeValidateUpdateCategory({ check })
    const call = getCheckCall('name')

    expect(call.optional).toHaveBeenCalled()
    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })

  it('Should validate description', () => {
    makeValidateUpdateCategory({ check })
    const call = getCheckCall('description')

    expect(call.optional).toHaveBeenCalled()
    expect(call.trim).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })

  it('Should validate allowsMultipleTerms', () => {
    makeValidateUpdateCategory({ check })
    const call = getCheckCall('allowsMultipleTerms')

    expect(call.optional).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isBoolean).toHaveBeenCalled()
  })

  it('Should ensure that the user is not trying to update terms', () => {
    makeValidateUpdateCategory({ check })
    const call = getCheckCall('terms')

    expect(call.not).toHaveBeenCalled()
    expect(call.exists).toHaveBeenCalled()
  })
})
