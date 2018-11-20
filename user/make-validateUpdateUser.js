module.exports = ({ check, roles }) => [
  check('id').isMongoId().withMessage('invalid user id'),

  check('name').optional().trim()
  .not().isEmpty().withMessage('name is empty')
  .isString().withMessage('name should be a String'),

  check('email').optional().trim()
  .not().isEmpty().withMessage('email is empty')
  .isEmail().withMessage('invalid email format'),

  check('password').optional()
  .isString().withMessage('password should be a String')
  .isLength({ min: 8 }).withMessage('password should be at least 8 characters long')
  .custom((password, { req }) => {
    if (password !== req.body.passwordConfirmation) {
      throw new Error("passwords don't match")
    }

    return password
  }),

  check('role').optional()
  .isString().withMessage('role should be a String')
  .isIn(roles).withMessage(`role should be one of ${roles.join(', ')}`),

  check('jobRole').optional().trim()
  .not().isEmpty().withMessage('jobRole is empty')
  .isString().withMessage('jobRole should be a String'),

  check('isActive').optional()
  .isBoolean().withMessage('isActive should be a Boolean')
]
