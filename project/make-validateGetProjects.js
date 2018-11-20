module.exports = ({ check, status }) => [
  check('name').optional().trim()
  .isString().withMessage('name should be a String')
  .not().isEmpty().withMessage('name is empty'),

  check('status').optional().trim()
  .isString().withMessage('status should be a String')
  .not().isEmpty().withMessage('status is empty')
  .isIn(status).withMessage(`status should be one of ${status.join(', ')}`),

  check('people').optional()
  .isArray().withMessage('people should be an Array'),

  check('people.*')
  .isMongoId().withMessage('invalid user ID'),

  check('before').optional()
  .isISO8601().withMessage('before should be an ISO8601 Date.'),

  check('after').optional()
  .isISO8601().withMessage('before should be an ISO8601 Date.'),

  check('categories').optional()
  .isArray().withMessage('categories should be an Array'),

  check('categories.*')
  .isMongoId().withMessage('invalid category ID'),

  check('terms').optional()
  .isArray().withMessage('terms should be an Array'),

  check('terms.*')
  .isMongoId().withMessage('invalid term ID')
]
