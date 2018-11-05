const makeValidateUpdateCategory = require('./make-validateUpdateCategory')
const check = require('../misc/test-expressValidator')

describe('validateUpdateCategory', () => {
  it('Should validate id', () => {
    makeValidateUpdateCategory({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate name', () => {
    makeValidateUpdateCategory({ check })
    check.validate('name', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate description', () => {
    makeValidateUpdateCategory({ check })
    check.validate('description', 'optional', 'trim', 'isString', 'withMessage')
  })

  it('Should validate allowsMultipleTerms', () => {
    makeValidateUpdateCategory({ check })
    check.validate('allowsMultipleTerms', 'optional', 'not', 'isEmpty', 'isBoolean', 'withMessage')
  })

  it('Should ensure that the user is not trying to update terms', () => {
    makeValidateUpdateCategory({ check })
    check.validate('terms', 'not', 'exists', 'withMessage')
  })
})
