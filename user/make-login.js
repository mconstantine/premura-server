module.exports = ({ bcrypt, createError, trim, getDb }) => async (req, res, next) => {
  const email = trim(req.body.email || '')
  const password = trim(req.body.password || '')

  if (!email.length) {
    return next(createError(400, 'missing required parameter email'))
  }

  if (!password.length) {
    return next(createError(400, 'missing required parameter password'))
  }

  const user = await (await getDb()).collection('users').findOne({ email })

  if (!user) {
    return next(createError(400, 'user not found'))
  }

  if (!await bcrypt.compare(password, user.password)) {
    return next(createError(401, 'invalid password'))
  }

  delete user.password

  req.session.user = user
  res.send(req.session.user)
}
