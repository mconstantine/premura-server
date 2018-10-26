module.exports = ({
  bcrypt,
  isEmail,
  trim,
  createError,
  roles,
  getDb
}) => async (req, res, next) => {
  const name = trim(req.body.name || ''),
        email = trim(req.body.email || ''),
        password = trim(req.body.password || ''),
        passwordConfirmation = trim(req.body.passwordConfirmation || ''),
        role = req.body.role || ''

  if (!name.length) {
    return next(createError(400, 'missing required parameter name'))
  }

  if (!email.length) {
    return next(createError(400, 'missing required parameter email'))
  }

  if (!isEmail(email)) {
    return next(createError(400, 'invalid email format'))
  }

  if (!password.length) {
    return next(createError(400, 'missing required parameter password'))
  }

  if (!passwordConfirmation.length) {
    return next(createError(400, 'missing required parameter passwordConfirmation'))
  }

  if (password !== passwordConfirmation) {
    return next(createError(400, 'password and passwordConfirmation should be equal'))
  }

  if (!role) {
    return next(createError(400, 'missing required parameter role'))
  }

  if (!roles.includes(role)) {
    return next(createError(400, `role should be one of ${roles.join(', ')}`))
  }

  if (roles.indexOf(req.session.user.role) < roles.indexOf(role)) {
    return next(createError(401, 'you cannot register a user with a role higher than yours'))
  }

  const collection = (await getDb()).collection('users')
  const alreadyExistingUser = await collection.findOne({ email })

  if (alreadyExistingUser) {
    return next(createError(400, 'a user with this email address already exists'))
  }

  await collection.insertOne({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role
  })

  res.status(201).end()
}
