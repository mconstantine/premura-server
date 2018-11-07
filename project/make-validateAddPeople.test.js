const makeValidateAddPeople = require('./make-validateAddPeople')
const check = require('../misc/test-expressValidator')

describe('addPeople', () => {
  it('Should validate id', () => {
    makeValidateAddPeople({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateAddPeople({ check })
    check.validate('people', 'isArray', 'withMessage')
  })

  it('Should validate people IDs', () => {
    makeValidateAddPeople({ check })
    check.validate('people.*._id', 'isMongoId', 'withMessage')
  })

  it('Should validate people budgets', () => {
    makeValidateAddPeople({ check })
    check.validate('people.*.budget', 'optional', 'isNumeric', 'withMessage')
  })
})
