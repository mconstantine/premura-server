module.exports = ({
  createError, ObjectID, getDb, roles, trim, bcrypt, isEmail
}) => async (req, res, next) => {
  if (!req.params.id) {
    return next(createError(400, 'missing required parameter id'))
  }

  let _id

  try {
    _id = new ObjectID(req.params.id)
  } catch (ex) {
    return next(createError(404, 'user not found'))
  }

  const collection = (await getDb()).collection('users')
  const user = await collection.findOne({ _id })

  if (!user) {
    return next(createError(404, 'user not found'))
  }

  const currentUser = req.session.user
  const update = {}

  if (req.body.role) {
    const role = trim(req.body.role)
    delete req.body.role

    if (!roles.includes(role)) {
      return next(createError(400, `role should be one of ${roles.join(', ')}`))
    }

    if (roles.indexOf(currentUser.role) <= roles.indexOf(user.role)) {
      return next(createError(401, "only a user with a higher role can change another user's role"))
    }

    update.role = role
  }

  if (req.body.email) {
    const email = trim(req.body.email)
    delete req.body.email

    if (!isEmail(email)) {
      return next(createError(400, 'invalid email format'))
    }

    if (currentUser._id != user._id.toString() && currentUser.role !== 'master') {
      return next(createError(401, 'you can change only your own e-mail address'))
    }

    update.email = email
  }

  if (req.body.password) {
    const password = trim(req.body.password)
    delete req.body.password

    if (currentUser._id != user._id.toString() && currentUser.role !== 'master') {
      return next(createError(401, 'you can change only your own password'))
    }

    update.password = await bcrypt.hash(password, 10)
  }

  for (let i in req.body) {
    if (i === '_id') {
      continue
    }

    if (currentUser._id != user._id.toString()) {
      return next(createError(401, 'you can change this information only for your own profile'))
    }

    switch(i) {
      case 'name':
        const name = trim(req.body.name)

        if (!name) {
          return next(createError(400, 'name is empty'))
        }

        update.name = name
        break
      default:
        break
    }
  }

  await collection.updateOne({ _id }, { $set: update })

  if (update.email || update.password) {
    return res.redirect('/users/logout')
  }

  for (let i in update) {
    if (req.session.user[i]) {
      req.session.user[i] = update[i]
    }
  }

  return res.send(req.session.user)
}
