module.exports = ({ check, langs }) => [
  check('email').trim()
  .not().isEmpty().withMessage('email is empty')
  .isEmail().withMessage('invalid email format'),

  check('password')
  .isString().withMessage('password should be a String')
  .not().isEmpty().withMessage('password is empty'),

  check('lang')
  .not().isEmpty().withMessage('lang is empty')
  .isIn(langs).withMessage(`lang should be one of ${langs.join(', ')}`)
]
