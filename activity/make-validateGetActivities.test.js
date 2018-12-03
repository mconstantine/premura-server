const check = require('../misc/test-expressValidator')
const makeValidateGetActivities = require('./make-validateGetActivities')

describe('validateGetActivities', () => {
  it('Should validate title', () => {
    makeValidateGetActivities({ check })
    check.validate('title', 'optional', 'trim', 'isString', 'withMessage')
  })

  it('Should validate project', () => {
    makeValidateGetActivities({ check })
    check.validate('project', 'optional', 'isMongoId', 'withMessage')
  })

  it('Should validate recipient', () => {
    makeValidateGetActivities({ check })
    check.validate('recipient', 'optional', 'isMongoId', 'withMessage')
  })

  it('Should validate before', () => {
    makeValidateGetActivities({ check })
    check.validate('before', 'optional', 'isISO8601', 'withMessage')
  })

  it('Should validate after', () => {
    makeValidateGetActivities({ check })
    check.validate('after', 'optional', 'isISO8601', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateGetActivities({ check })
    check.validate('people', 'optional', 'isArray', 'withMessage')
  })

  it('Should validate single people', () => {
    makeValidateGetActivities({ check })
    check.validate('people.*', 'optional', 'isMongoId', 'withMessage')
  })
})
