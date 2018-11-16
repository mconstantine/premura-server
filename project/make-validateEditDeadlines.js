const { check } = require('express-validator/check')

module.exports = ({}) => [
  check('id')
  .isMongoId().withMessage('invalid project id'),

  check('deadlines')
  .isArray().withMessage('deadlines should be an Array'),

  check('deadlines.*')
  .isISO8601().withMessage('deadlines should be ISO8601 Dates')
]
