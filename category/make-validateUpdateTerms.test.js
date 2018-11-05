const makeValidateUpdateTerms = require('./make-validateUpdateTerms')
const check = require('../misc/test-expressValidator')

describe('validateUpdateTerms', () => {
  it('Should validate category ID', () => {
    makeValidateUpdateTerms({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate terms', () => {
    makeValidateUpdateTerms({ check })
    check.validate('terms', 'isArray', 'withMessage')
  })

  it('Should validate terms IDs', () => {
    makeValidateUpdateTerms({ check })
    check.validate('terms.*._id', 'isMongoId', 'withMessage')
  })

  it('Should validate terms names', () => {
    makeValidateUpdateTerms({ check })
    check.validate('terms.*.name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should ensure that the user is not trying to update projects', () => {
    makeValidateUpdateTerms({ check })
    check.validate('terms.*.projects', 'not', 'exists', 'withMessage')
  })
})
