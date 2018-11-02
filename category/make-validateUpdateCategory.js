module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid category id'),

  check('name').optional().trim()
  .not().isEmpty().withMessage('name is empty'),

  check('description').optional().trim(),

  check('allowsMultipleTerms').optional()
  .not().isEmpty().withMessage('allowsMultipleTerms is empty')
  .isBoolean().withMessage('allowsMultipleTerms should be a boolean value'),

  check('terms')
  .not().exists().withMessage('this endpoint cannot operate on terms')
]
