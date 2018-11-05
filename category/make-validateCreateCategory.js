module.exports = ({ check }) => [
  check('name').trim()
  .not().isEmpty().withMessage('name is empty')
  .isString().withMessage('name should be a String'),

  check('description').optional().trim()
  .not().isEmpty().withMessage('description is empty')
  .isString().withMessage('description should be a String'),

  check('allowsMultipleTerms')
  .not().isEmpty().withMessage('allowsMultipleTerms is empty')
  .isBoolean().withMessage('allowsMultipleTerms should be a boolean value'),

  check('terms')
  .not().exists().withMessage('this endpoint cannot operate on terms')
]
