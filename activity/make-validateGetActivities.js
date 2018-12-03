module.exports = ({ check }) => [
  check('title').optional().trim()
  .isString().withMessage('title should be a String'),

  check('project').optional()
  .isMongoId().withMessage('invalid project id'),

  check('recipient').optional()
  .isMongoId().withMessage('invalid user id'),

  check('before').optional()
  .isISO8601().withMessage('before should be a valid ISO8601 Date'),

  check('after').optional()
  .isISO8601().withMessage('after should be a valid ISO8601 Date'),

  check('people').optional()
  .isArray().withMessage('people should be an Array'),

  check('people.*').optional()
  .isMongoId().withMessage('invalid person id'),
]
