module.exports = ({ check }) => [
  check('id')
  .isMongoId().withMessage('invalid category id'),

  check('terms')
  .isArray().withMessage('terms should be an Array'),

  check('terms.*.name').trim()
  .not().isEmpty().withMessage('missing term name')
]
