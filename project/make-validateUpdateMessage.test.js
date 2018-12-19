const makeValidateUpdateMessage = require('./make-validateUpdateMessage')
const check = require('../misc/test-expressValidator')

describe('updateMessage', () => {
  it('Should validate project ID', () => {
    makeValidateUpdateMessage({ check })
    check.validate('id', 'isMongoId', 'withMessage')
  })

  it('Should validate message ID', () => {
    makeValidateUpdateMessage({ check })
    check.validate('messageId', 'isMongoId', 'withMessage')
  })

  it('Should validate content', () => {
    makeValidateUpdateMessage({ check })
    check.validate('content', 'trim', 'not', 'isEmpty', 'isString', 'withMessage')
  })
})
