module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid category id'),

  check('terms')
  .isArray().withMessage('terms should be an Array'),

  check('terms.*._id')
  .isMongoId().withMessage('invalid term id'),

  check('terms.*.name').trim()
  .not().isEmpty().withMessage('missing or invalid name')
  .isString().withMessage('name should be a String'),

  check('terms.*.projects')
  .not().exists().withMessage('this endpoint cannot operate on projects')
]
