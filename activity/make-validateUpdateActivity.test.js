const check = require('../misc/test-expressValidator')
const makeValidateUpdateActivity = require('./make-validateUpdateActivity')

describe('validateUpdateActivity', () => {
  it('Should validate title', () => {
    makeValidateUpdateActivity({ check })
    check.validate(
      'title', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage'
    )
  })

  it('Should validate description', () => {
    makeValidateUpdateActivity({ check })
    check.validate('description', 'optional', 'trim', 'isString', 'withMessage')
  })

  it('Should validate project', () => {
    makeValidateUpdateActivity({ check })
    check.validate('project', 'optional', 'isMongoId', 'withMessage')
  })

  it('Should validate recipient', () => {
    makeValidateUpdateActivity({ check })
    check.validate('recipient', 'optional', 'isMongoId', 'withMessage')
  })

  it('Should validate timeFrom', () => {
    makeValidateUpdateActivity({ check })
    check.validate('timeFrom', 'optional', 'isISO8601', 'withMessage')
  })

  it('Should validate timeTo', () => {
    makeValidateUpdateActivity({ check })
    check.validate('timeTo', 'optional', 'isISO8601', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateUpdateActivity({ check })
    check.validate('people', 'not', 'exists', 'withMessage')
  })
})
