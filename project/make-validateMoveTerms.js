module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid project id'),

  check('destination')
  .isMongoId().withMessage('invalid destination project id')
]
