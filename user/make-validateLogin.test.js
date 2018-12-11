const makeValidateLogin = require('./make-validateLogin')
const check = require('../misc/test-expressValidator')
const langs = require('../misc/langs')

describe('validateLogin', () => {
  it('Should validate the email', () => {
    makeValidateLogin({ check, langs })
    check.validate('email', 'trim', 'not', 'isEmpty', 'isEmail', 'withMessage')
  })

  it('Should validate the password', () => {
    makeValidateLogin({ check, langs })
    check.validate('password', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate lang', () => {
    makeValidateLogin({ check, langs })
    check.validate('lang', 'not', 'isEmpty', 'isIn', 'withMessage')
  })
})
