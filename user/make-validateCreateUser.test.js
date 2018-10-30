const makeValidateCreateUser = require('./make-validateCreateUser')
const roles = require('../misc/roles')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateCreateUser', () => {
  it('Should validate the name', async () => {
    makeValidateCreateUser({ check, roles })
    const call = getCheckCall('name')

    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
  })

  it('Should validate the email', () => {
    makeValidateCreateUser({ check, roles })
    const call = getCheckCall('email')

    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isEmail).toHaveBeenCalled()
  })

  it('Should validate the password', () => {
    makeValidateCreateUser({ check, roles })
    const call = getCheckCall('password')

    expect(call.isLength).toHaveBeenCalled()
    expect(call.custom).toHaveBeenCalled()
  })

  it('Should validate the role', () => {
    makeValidateCreateUser({ check, roles })
    const call = getCheckCall('role')

    expect(call.isIn).toHaveBeenCalled()
  })

  it('Should validate the jobRole', () => {
    makeValidateCreateUser({ check, roles })
    const call = getCheckCall('jobRole')

    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
  })
})
