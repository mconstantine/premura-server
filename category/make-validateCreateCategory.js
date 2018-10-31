module.exports = ({ check }) => [
  check('name').trim()
  .not().isEmpty().withMessage('name is empty'),

  check('description').optional().trim()
  .not().isEmpty().withMessage('description is empty'),

  check('allowsMultipleTerms')
  .not().isEmpty().withMessage('allowsMultipleTerms is empty')
  .isBoolean().withMessage('allowsMultipleTerms should be a boolean value')
  .toBoolean()
]
