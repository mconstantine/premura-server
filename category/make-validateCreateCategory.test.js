const { check, getCheckCall } = require('../misc/test-expressValidator')
const makeValidateCreateCategory = require('./make-validateCreateCategory')

describe('validateCreateCategory', () => {
  it('Should validate name', () => {
    makeValidateCreateCategory({ check })
    const call = getCheckCall('name')

    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
  })

  it('Should validate description', () => {
    makeValidateCreateCategory({ check })
    const call = getCheckCall('description')

    expect(call.optional).toHaveBeenCalled()
    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
  })

  it('Should validate allowsMultipleTerms', () => {
    makeValidateCreateCategory({ check })
    const call = getCheckCall('allowsMultipleTerms')

    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isBoolean).toHaveBeenCalled()
  })

  it('Should ensure that the user is not trying to create terms', () => {
    makeValidateCreateCategory({ check })
    const call = getCheckCall('terms')

    expect(call.not).toHaveBeenCalled()
    expect(call.exists).toHaveBeenCalled()
  })
})
