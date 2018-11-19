const makeValidateMoveTerms = require('./make-validateEditTerms')
const check = require('../misc/test-expressValidator')

describe('addTerms', () => {
  it('Should validate id', () => {
    makeValidateMoveTerms({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate destination project id', () => {
    makeValidateMoveTerms({ check })
    check.validate('terms.*', 'isMongoId', 'withMessage')
  })
})
