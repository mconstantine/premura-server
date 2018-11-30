module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid activity id'),

  check('people')
  .isArray().withMessage('people should be an Array'),

  check('people.*')
  .isMongoId().withMessage('invalid person id')
]
