const makeValidateLogin = require('./make-validateLogin')
const { check, getCheckCall } = require('../misc/test-expressValidator')

describe('validateLogin', () => {
  it('Should validate the email', () => {
    makeValidateLogin({ check })
    const call = getCheckCall('email')

    expect(call.trim).toHaveBeenCalled()
    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
    expect(call.isEmail).toHaveBeenCalled()
  })

  it('Should validate the password', () => {
    makeValidateLogin({ check })
    const call = getCheckCall('password')

    expect(call.not).toHaveBeenCalled()
    expect(call.isEmpty).toHaveBeenCalled()
  })
})
