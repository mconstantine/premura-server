module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid category id'),

  check('terms')
  .isArray().withMessage('terms should be an Array'),

  check('terms.*._id')
  .isMongoId().withMessage('invalid term id')
]
