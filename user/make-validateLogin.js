module.exports = ({ check }) => [
  check('email').trim()
  .not().isEmpty().withMessage('email is empty')
  .isEmail().withMessage('invalid email format'),

  check('password')
  .isString().withMessage('password should be a String')
  .not().isEmpty().withMessage('password is empty')
]
