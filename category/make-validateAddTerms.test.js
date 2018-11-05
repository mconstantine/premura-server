const makeValidateAddTerms = require('./make-validateAddTerms')
const check = require('../misc/test-expressValidator')

describe('validateAddTerms', () => {
  it('Should validate id', () => {
    makeValidateAddTerms({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate terms', () => {
    makeValidateAddTerms({ check })
    check.validate('terms', 'isArray', 'withMessage')
  })

  it('Should validate terms names', () => {
    makeValidateAddTerms({ check })
    check.validate('terms.*.name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
