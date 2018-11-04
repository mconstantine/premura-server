module.exports = ({
  createError, ObjectID, getDb, roles, bcrypt, sensitiveInformationProjection
}) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid user id'
      }]
    })
  }

  const _id = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('users')
  const user = await collection.findOne({ _id })

  if (!user) {
    return next(createError(404, 'user not found'))
  }

  const currentUser = req.session.user
  const update = {}

  if (req.body.role) {
    const role = req.body.role
    delete req.body.role

    if (roles.indexOf(currentUser.role) <= roles.indexOf(user.role)) {
      return next(createError(401, "only a user with a higher role can change another user's role"))
    }

    update.role = role
  }

  if (req.body.email) {
    const email = req.body.email
    delete req.body.email

    if (currentUser._id != user._id.toString() && currentUser.role !== 'master') {
      return next(createError(401, 'you can change only your own e-mail address'))
    }

    const alreadyExistingUser = await collection.findOne(
      { email },
      { projection: sensitiveInformationProjection }
    )

    if (alreadyExistingUser) {
      return next(createError(409, JSON.stringify(alreadyExistingUser)))
    }

    update.email = email
  }

  if (req.body.password) {
    const password = req.body.password
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
      case 'jobRole':
        update[i] = req.body[i]
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
    // This if statement is why we don't need to hide sensitive information
    if (req.session.user[i]) {
      req.session.user[i] = update[i]
    }
  }

  return res.send(req.session.user)
}
