const makeValidateUpdateUser = require('./make-validateUpdateUser')
const roles = require('../misc/roles')
const langs = require('../misc/langs')
const check = require('../misc/test-expressValidator')

describe('validateUpdateUser', () => {
  it('Should validate the id', async () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate the name', async () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('name', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate the email', () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('email', 'optional', 'trim', 'not', 'isEmpty', 'isEmail', 'withMessage')
  })

  it('Should validate the password', () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('password', 'optional', 'isLength', 'custom', 'isString', 'withMessage')
  })

  it('Should validate the role', () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('role', 'optional', 'isIn', 'isString', 'withMessage')
  })

  it('Should validate the lang', () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('lang', 'optional', 'isIn', 'isString', 'withMessage')
  })

  it('Should validate the jobRole', () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('jobRole', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate isActive', () => {
    makeValidateUpdateUser({ check, roles, langs })
    check.validate('isActive', 'optional', 'isBoolean', 'withMessage')
  })
})
