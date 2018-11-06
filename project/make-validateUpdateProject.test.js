const makeValidateUpdateProject = require('./make-validateUpdateProject')
const check = require('../misc/test-expressValidator')
const status = require('../misc/status')

describe('validateUpdateProject', () => {
  it('Should validate id', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('id', 'isMongoId', 'withMessage')
  }),

  it('Should validate name', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('name', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate description', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('description', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate budget', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('budget', 'optional', 'trim', 'isNumeric', 'withMessage')
  })

  it('Should validate status', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('status', 'optional', 'isIn', 'isString', 'withMessage')
  })

  it('Should refuse to operate on people', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('people', 'not', 'exists', 'withMessage')
  })

  it('Should refuse to operate on deadlines', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('deadlines', 'not', 'exists', 'withMessage')
  })

  it('Should refuse to operate on terms', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('terms', 'not', 'exists', 'withMessage')
  })

  it('Should validate status', () => {
    makeValidateUpdateProject({ check, status })
    check.validate('status', 'optional', 'isIn', 'isString', 'withMessage')
  })
})
