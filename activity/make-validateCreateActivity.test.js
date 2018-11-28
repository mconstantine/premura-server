const check = require('../misc/test-expressValidator')
const makeValidateCreateActivity = require('./make-validateCreateActivity')

describe('validateCreateActivity', () => {
  it('Should validate title', () => {
    makeValidateCreateActivity({ check })
    check.validate('title', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate description', () => {
    makeValidateCreateActivity({ check })
    check.validate('description', 'optional', 'trim', 'isString', 'withMessage')
  })

  it('Should validate project', () => {
    makeValidateCreateActivity({ check })
    check.validate('project', 'not', 'isEmpty', 'isMongoId', 'withMessage')
  })

  it('Should validate recipient', () => {
    makeValidateCreateActivity({ check })
    check.validate('recipient', 'not', 'isEmpty', 'isMongoId', 'withMessage')
  })

  it('Should validate timeFrom', () => {
    makeValidateCreateActivity({ check })
    check.validate('timeFrom', 'not', 'isEmpty', 'isISO8601', 'withMessage')
  })

  it('Should validate timeTo', () => {
    makeValidateCreateActivity({ check })
    check.validate('timeTo', 'not', 'isEmpty', 'isISO8601', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateCreateActivity({ check })
    check.validate('people', 'not', 'exists', 'withMessage')
  })
})
