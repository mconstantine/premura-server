const makeValidateCreateProject = require('./make-validateCreateProject')
const check = require('../misc/test-expressValidator')
const status = require('../misc/status')

describe('validateCreateProject', () => {
  it('Should validate name', () => {
    makeValidateCreateProject({ check, status })
    check.validate('name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate description', () => {
    makeValidateCreateProject({ check, status })
    check.validate('description', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateCreateProject({ check, status })
    check.validate('people', 'optional', 'isArray', 'custom', 'withMessage')
  })

  it('Should validate people IDs', () => {
    makeValidateCreateProject({ check, status })
    check.validate('people.*._id', 'isMongoId', 'withMessage')
  })

  it('Should validate budget', () => {
    makeValidateCreateProject({ check, status })
    check.validate('budget', 'optional', 'trim', 'isNumeric', 'withMessage')
  })

  it('Should validate deadlines', () => {
    makeValidateCreateProject({ check, status })
    check.validate('deadlines', 'optional', 'isArray', 'withMessage')
  })

  it('Should validate deadlines dates', () => {
    makeValidateCreateProject({ check, status })
    check.validate('deadlines.*', 'optional', 'isISO8601', 'isAfter', 'withMessage')
  })

  it('Should validate terms', () => {
    makeValidateCreateProject({ check, status })
    check.validate('terms', 'not', 'exists', 'withMessage')
  })

  it('Should validate status', () => {
    makeValidateCreateProject({ check, status })
    check.validate('status', 'optional', 'isIn', 'isString', 'withMessage')
  })
})
