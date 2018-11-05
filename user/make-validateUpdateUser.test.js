const makeValidateUpdateUser = require('./make-validateUpdateUser')
const roles = require('../misc/roles')
const check = require('../misc/test-expressValidator')

describe('validateUpdateUser', () => {
  it('Should validate the id', async () => {
    makeValidateUpdateUser({ check, roles })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate the name', async () => {
    makeValidateUpdateUser({ check, roles })
    check.validate('name', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate the email', () => {
    makeValidateUpdateUser({ check, roles })
    check.validate('email', 'optional', 'trim', 'not', 'isEmpty', 'isEmail', 'withMessage')
  })

  it('Should validate the password', () => {
    makeValidateUpdateUser({ check, roles })
    check.validate('password', 'optional', 'isLength', 'custom', 'isString', 'withMessage')
  })

  it('Should validate the role', () => {
    makeValidateUpdateUser({ check, roles })
    check.validate('role', 'optional', 'isIn', 'isString', 'withMessage')
  })

  it('Should validate the jobRole', () => {
    makeValidateUpdateUser({ check, roles })
    check.validate('jobRole', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
