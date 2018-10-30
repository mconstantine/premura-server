const makeValidateCreateUser = require('./make-validateCreateUser')
const roles = require('../misc/roles')

describe('validateCreateUser', () => {
  let getCheckCall
  const check = function(what) {
    this.whats = this.whats || []
    this.whats.push(what)

    this.calls = this.calls || []
    this.calls.push({
      trim: jest.fn(function() { return this }),
      not: jest.fn(function() { return this }),
      isEmpty: jest.fn(function() { return this }),
      withMessage: jest.fn(function() { return this }),
      isEmail: jest.fn(function() { return this }),
      isLength: jest.fn(function() { return this }),
      custom: jest.fn(function() { return this }),
      isIn: jest.fn(function() { return this })
    })

    getCheckCall = function(what) {
      const callIndex = this.whats.indexOf(what)

      if (callIndex < 0) {
        return false
      }

      return this.calls[callIndex]
    }

    return this.calls[this.calls.length - 1]
  }

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
