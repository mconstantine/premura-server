const makeValidateEditPeople = require('./make-validateEditPeople')
const check = require('../misc/test-expressValidator')

describe('addPeople', () => {
  it('Should validate id', () => {
    makeValidateEditPeople({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateEditPeople({ check })
    check.validate('people', 'isArray', 'withMessage')
  })

  it('Should validate people IDs', () => {
    makeValidateEditPeople({ check })
    check.validate('people.*._id', 'isMongoId', 'withMessage')
  })

  it('Should validate people budgets', () => {
    makeValidateEditPeople({ check })
    check.validate('people.*.budget', 'optional', 'isNumeric', 'withMessage')
  })
})
