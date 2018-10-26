const createError = require('./createServerError')

module.exports = (req, res, next) => {
  let error

  if (!req.session.user) {
    error = createError(401, 'you must login to continue')
  }

  return next(error)
}
