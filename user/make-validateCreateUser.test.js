const makeValidateCreateUser = require('./make-validateCreateUser')
const roles = require('../misc/roles')
const check = require('../misc/test-expressValidator')

describe('validateCreateUser', () => {
  it('Should validate the name', async () => {
    makeValidateCreateUser({ check, roles })
    check.validate('name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate the email', () => {
    makeValidateCreateUser({ check, roles })
    check.validate('email', 'trim', 'not', 'isEmpty', 'isEmail', 'withMessage')
  })

  it('Should validate the password', () => {
    makeValidateCreateUser({ check, roles })
    check.validate('password', 'isLength', 'custom', 'isString', 'withMessage')
  })

  it('Should validate the role', () => {
    makeValidateCreateUser({ check, roles })
    check.validate('role', 'isIn', 'isString', 'withMessage')
  })

  it('Should validate the jobRole', () => {
    makeValidateCreateUser({ check, roles })
    check.validate('jobRole', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
