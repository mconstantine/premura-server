module.exports = ({ check }) => [
  check('title').optional().trim()
  .not().isEmpty().withMessage('title is required')
  .isString().withMessage('title should be a String'),

  check('description').optional().trim()
  .isString().withMessage('description should be a String'),

  check('project').optional()
  .isMongoId().withMessage('invalid project id'),

  check('recipient').optional()
  .isMongoId().withMessage('invalid recipient id'),

  check('timeFrom').optional()
  .isISO8601().withMessage('timeFrom should be a valid ISO8601 Date'),

  check('timeTo').optional()
  .isISO8601().withMessage('timeTo should be a valid ISO8601 Date'),

  check('people')
  .not().exists().withMessage('this endpoint cannot operate on people')
]
