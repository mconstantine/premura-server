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

  it('Should validate budget', () => {
    makeValidateCreateProject({ check, status })
    check.validate('budget', 'optional', 'trim', 'isNumeric', 'withMessage')
  })

  it('Should validate status', () => {
    makeValidateCreateProject({ check, status })
    check.validate('status', 'optional', 'isIn', 'isString', 'withMessage')
  })

  it('Should refuse to operate on people', () => {
    makeValidateCreateProject({ check, status })
    check.validate('people', 'not', 'exists', 'withMessage')
  })

  it('Should refuse to operate on deadlines', () => {
    makeValidateCreateProject({ check, status })
    check.validate('deadlines', 'not', 'exists', 'withMessage')
  })

  it('Should refuse to operate on terms', () => {
    makeValidateCreateProject({ check, status })
    check.validate('terms', 'not', 'exists', 'withMessage')
  })

  it('Should validate status', () => {
    makeValidateCreateProject({ check, status })
    check.validate('status', 'optional', 'isIn', 'isString', 'withMessage')
  })
})
