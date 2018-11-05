const makeValidateRemoveTerms = require('./make-validateRemoveTerms')
const check = require('../misc/test-expressValidator')

describe('validateRemoveTerms', () => {
  it('Should validate category ID', () => {
    makeValidateRemoveTerms({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate terms', () => {
    makeValidateRemoveTerms({ check })
    check.validate('terms', 'isArray', 'withMessage')
  })

  it('Should validate terms IDs', () => {
    makeValidateRemoveTerms({ check })
    check.validate('terms.*._id', 'isMongoId', 'withMessage')
  })
})
