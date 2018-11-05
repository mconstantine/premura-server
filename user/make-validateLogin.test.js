const makeValidateLogin = require('./make-validateLogin')
const check = require('../misc/test-expressValidator')

describe('validateLogin', () => {
  it('Should validate the email', () => {
    makeValidateLogin({ check })
    check.validate('email', 'trim', 'not', 'isEmpty', 'isEmail', 'withMessage')
  })

  it('Should validate the password', () => {
    makeValidateLogin({ check })
    check.validate('password', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
