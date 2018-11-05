const makeValidateCreateProject = require('./make-validateCreateProject')
const check = require('../misc/test-expressValidator')

describe('validateCreateProject', () => {
  it('Should validate name', () => {
    makeValidateCreateProject({ check })
    check.validate('name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate description', () => {
    makeValidateCreateProject({ check })
    check.validate('description', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateCreateProject({ check })
    check.validate('people', 'optional', 'isArray', 'custom', 'withMessage')
  })

  it('Should validate people IDs', () => {
    makeValidateCreateProject({ check })
    check.validate('people.*._id', 'isMongoId', 'withMessage')
  })

  it('Should validate budget', () => {
    makeValidateCreateProject({ check })
    check.validate('budget', 'optional', 'trim', 'isNumeric', 'withMessage')
  })

  it('Should validate deadlines', () => {
    makeValidateCreateProject({ check })
    check.validate('deadlines', 'optional', 'isArray', 'withMessage')
  })

  it('Should validate deadlines dates', () => {
    makeValidateCreateProject({ check })
    check.validate('deadlines.*', 'optional', 'isISO8601', 'isAfter', 'withMessage')
  })

  it('Should validate terms', () => {
    makeValidateCreateProject({ check })
    check.validate('terms', 'not', 'exists', 'withMessage')
  })
})
