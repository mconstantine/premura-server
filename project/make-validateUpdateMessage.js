module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('Invalid project ID'),

  check('messageId')
  .isMongoId().withMessage('Invalid message ID'),

  check('content').trim()
  .not().isEmpty().withMessage('content is required')
  .isString().withMessage('content should be a String')
]
