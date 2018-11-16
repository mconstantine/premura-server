const makeValidateEditDeadlines = require('./make-validateEditDeadlines')
const check = require('../misc/test-expressValidator')

describe('validateEditDeadlines', () => {
  it('Should validate id', () => {
    makeValidateEditDeadlines({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate deadlines', () => {
    makeValidateEditDeadlines({ check })
    check.validate('deadlines', 'isArray', 'withMessage')
  })

  it('Should validate each deadline', () => {
    makeValidateEditDeadlines({ check })
    check.validate('deadlines.*', 'isISO8601', 'withMessage')
  })
})
