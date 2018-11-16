module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid project id'),

  check('terms')
  .isArray().withMessage('terms should be an Array'),

  check('terms.*')
  .isMongoId().withMessage('invalid term id')
]
