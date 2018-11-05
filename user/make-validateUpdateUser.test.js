const makeValidateUpdateUser = require('./make-validateUpdateUser')
const roles = require('../misc/roles')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateUpdateUser', () => {
  it('Should validate the id', async () => {
  makeValidateUpdateUser({ check, roles })
  const call = getCheckCall('id')
  expect(call.isMongoId).toHaveBeenCalled()
})

  it('Should validate the name', async () => {
    makeValidateUpdateUser({ check, roles })
    const call = getCheckCall('name')

    expect(call.optional).toHaveBeenCalled()
    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })

  it('Should validate the email', () => {
    makeValidateUpdateUser({ check, roles })
    const call = getCheckCall('email')

    expect(call.optional).toHaveBeenCalled()
    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isEmail).toHaveBeenCalled()
  })

  it('Should validate the password', () => {
    makeValidateUpdateUser({ check, roles })
    const call = getCheckCall('password')

    expect(call.optional).toHaveBeenCalled()
    expect(call.isLength).toHaveBeenCalled()
    expect(call.custom).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })

  it('Should validate the role', () => {
    makeValidateUpdateUser({ check, roles })
    const call = getCheckCall('role')

    expect(call.optional).toHaveBeenCalled()
    expect(call.isIn).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })

  it('Should validate the jobRole', () => {
    makeValidateUpdateUser({ check, roles })
    const call = getCheckCall('jobRole')

    expect(call.optional).toHaveBeenCalled()
    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isString).toHaveBeenCalled()
  })
})
