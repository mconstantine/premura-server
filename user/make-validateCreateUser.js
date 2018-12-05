module.exports = ({ check, roles, langs }) => [
  check('name').trim()
  .not().isEmpty().withMessage('name is empty')
  .isString().withMessage('name should be a String'),

  check('email').trim()
  .not().isEmpty().withMessage('email is empty')
  .isEmail().withMessage('invalid email format'),

  check('password')
  .isString().withMessage('password should be a String')
  .isLength({ min: 8 }).withMessage('password should be at least 8 characters long')
  .custom((password, { req }) => {
    if (password !== req.body.passwordConfirmation) {
      throw new Error("passwords don't match")
    }

    return password
  }),

  check('role')
  .isString().withMessage('role should be a String')
  .isIn(roles).withMessage(`role should be one of ${roles.join(', ')}`),

  check('lang')
  .isString().withMessage('lang should be a String')
  .isIn(langs).withMessage(`lang should be one of ${langs.join(', ')}`),

  check('jobRole').trim()
  .not().isEmpty().withMessage('jobRole is empty')
  .isString().withMessage('jobRole should be a String')
]
