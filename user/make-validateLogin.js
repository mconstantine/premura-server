module.exports = ({ check }) => [
  check('email').trim()
  .not().isEmpty().withMessage('email is empty')
  .isEmail().withMessage('invalid email format'),

  check('password')
  .not().isEmpty().withMessage('password is empty')
]
