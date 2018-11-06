const makeValidateGetProjects = require('./make-validateGetProjects')
const check = require('../misc/test-expressValidator')
const status = require('../misc/status')

describe('validateGetProjects', () => {
  it('should check name', () => {
    makeValidateGetProjects({ check, status })
    check.validate('name', 'optional', 'trim', 'isString', 'not', 'isEmpty', 'withMessage')
  })

  it('should check status', () => {
    makeValidateGetProjects({ check, status })
    check.validate('status', 'optional', 'trim', 'isString', 'not', 'isEmpty', 'isIn', 'withMessage')
  })

  it('should check people', () => {
    makeValidateGetProjects({ check, status })
    check.validate('people', 'optional', 'isArray', 'withMessage')
  })

  it('should check people IDs', () => {
    makeValidateGetProjects({ check, status })
    check.validate('people.*', 'isMongoId', 'withMessage')
  })

  it('should check before', () => {
    makeValidateGetProjects({ check, status })
    check.validate('before', 'optional', 'isISO8601', 'withMessage')
  })

  it('should check after', () => {
    makeValidateGetProjects({ check, status })
    check.validate('after', 'optional', 'isISO8601', 'withMessage')
  })
})
