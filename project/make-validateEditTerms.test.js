const makeValidateEditTerms = require('./make-validateEditTerms')
const check = require('../misc/test-expressValidator')

describe('addTerms', () => {
  it('Should validate id', () => {
    makeValidateEditTerms({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate terms', () => {
    makeValidateEditTerms({ check })
    check.validate('terms', 'isArray', 'withMessage')
  })

  it('Should validate terms IDs', () => {
    makeValidateEditTerms({ check })
    check.validate('terms.*', 'isMongoId', 'withMessage')
  })
})
