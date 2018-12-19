module.exports = ({ check }) => [
  check('content').trim()
  .not().isEmpty().withMessage('content is required')
  .isString().withMessage('content should be a String')
]
