const makeValidateAddMessage = require('./make-validateAddMessage')
const check = require('../misc/test-expressValidator')

describe('validateAddMessage', () => {
  it('Should validate content', () => {
    makeValidateAddMessage({ check })
    check.validate('content', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
