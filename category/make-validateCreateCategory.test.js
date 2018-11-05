const check = require('../misc/test-expressValidator')
const makeValidateCreateCategory = require('./make-validateCreateCategory')

describe('validateCreateCategory', () => {
  it('Should validate name', () => {
    makeValidateCreateCategory({ check })
    check.validate('name', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate description', () => {
    makeValidateCreateCategory({ check })
    check.validate('description', 'optional', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })

  it('Should validate allowsMultipleTerms', () => {
    makeValidateCreateCategory({ check })
    check.validate('allowsMultipleTerms', 'not', 'isEmpty', 'isBoolean', 'withMessage')
  })

  it('Should ensure that the user is not trying to create terms', () => {
    makeValidateCreateCategory({ check })
    check.validate('terms', 'not', 'exists', 'withMessage')
  })
})
