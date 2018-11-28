module.exports = ({ check }) => [
  check('title').trim()
  .not().isEmpty().withMessage('title is required')
  .isString().withMessage('title should be a String'),

  check('description').optional().trim()
  .isString().withMessage('description should be a String'),

  check('project')
  .not().isEmpty().withMessage('project is required')
  .isMongoId().withMessage('invalid project id'),

  check('recipient')
  .not().isEmpty().withMessage('recipient is required')
  .isMongoId().withMessage('invalid recipient id'),

  check('timeFrom')
  .not().isEmpty().withMessage('timeFrom is required')
  .isISO8601().withMessage('timeFrom should be a valid ISO8601 Date'),

  check('timeTo')
  .not().isEmpty().withMessage('timeTo is required')
  .isISO8601().withMessage('timeTo should be a valid ISO8601 Date'),

  check('people')
  .not().exists().withMessage('this endpoint cannot operate on people')
]
