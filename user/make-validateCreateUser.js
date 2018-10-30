module.exports = ({ check, roles }) => [
  check('name').trim()
  .not().isEmpty().withMessage('name is empty'),

  check('email').trim()
  .not().isEmpty().withMessage('email is empty')
  .isEmail().withMessage('invalid email format'),

  check('password')
  .isLength({ min: 8 }).withMessage('password should be at least 8 characters long')
  .custom((password, { req }) => {
    if (password !== req.body.passwordConfirmation) {
      throw new Error("passwords don't match")
    }

    return password
  }),

  check('role')
  .isIn(roles).withMessage(`role should be one of ${roles.join(', ')}`),

  check('jobRole').trim()
  .not().isEmpty().withMessage('jobRole is empty')
]
