module.exports = ({ check, status }) => [
  check('name').trim()
  .not().isEmpty().withMessage('name is empty')
  .isString().withMessage('name should be a String'),

  check('description').optional().trim()
  .not().isEmpty().withMessage('description is empty')
  .isString().withMessage('description should be a String'),

  check('budget').optional().trim()
  .isNumeric().withMessage('budget should be a Number'),

  check('status').optional()
  .isString().withMessage('status should be a String')
  .isIn(status).withMessage(`status should be one of ${status.join(', ')}`),

  check('people')
  .not().exists().withMessage('this endpoint cannot operate on people'),

  check('deadlines')
  .not().exists().withMessage('this endpoint cannot operate on deadlines'),

  check('terms')
  .not().exists().withMessage('this endpoint cannot operate on terms')
]
