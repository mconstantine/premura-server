const makeValidateCreateUser = require('./make-validateCreateUser')
const roles = require('../misc/roles')
const langs = require('../misc/langs')
const check = require('../misc/test-expressValidator')

describe('validateCreateUser', () => {
  it('Should validate the name', async () => {
    makeValidateCreateUser({ check, roles, langs })
    check.validate('name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate the email', () => {
    makeValidateCreateUser({ check, roles, langs })
    check.validate('email', 'trim', 'not', 'isEmpty', 'isEmail', 'withMessage')
  })

  it('Should validate the password', () => {
    makeValidateCreateUser({ check, roles, langs })
    check.validate('password', 'isLength', 'custom', 'isString', 'withMessage')
  })

  it('Should validate the role', () => {
    makeValidateCreateUser({ check, roles, langs })
    check.validate('role', 'isIn', 'isString', 'withMessage')
  })

  it('Should validate the lang', () => {
    makeValidateCreateUser({ check, roles, langs })
    check.validate('lang', 'isIn', 'isString', 'withMessage')
  })

  it('Should validate the jobRole', () => {
    makeValidateCreateUser({ check, roles, langs })
    check.validate('jobRole', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
