const check = require('../misc/test-expressValidator')
const gt = require('../misc/test-gettext')
const makeValidateEditPeople = require('./make-validateEditPeople')

describe('validateGetActivities', () => {
  it('Should validate id', () => {
    makeValidateEditPeople({ check, gt })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate people', () => {
    makeValidateEditPeople({ check, gt })
    check.validate('people', 'isArray', 'withMessage')
  })

  it('Should validate people ids', () => {
    makeValidateEditPeople({ check, gt })
    check.validate('people.*', 'isMongoId', 'withMessage')
  })
})
