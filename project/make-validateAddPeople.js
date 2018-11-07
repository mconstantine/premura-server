module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid project id'),

  check('people')
  .isArray().withMessage('people should be an Array'),

  check('people.*._id')
  .isMongoId().withMessage('invalid person id'),

  check('people.*.budget').optional()
  .isNumeric().withMessage('budget should be a Number')
]
