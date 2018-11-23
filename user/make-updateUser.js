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
    delete req.body.passwordConfirmation

    if (currentUser._id != user._id.toString() && currentUser.role !== 'master') {
      return next(createError(401, 'you can change only your own password'))
    }

    update.password = await bcrypt.hash(password, 10)
  }

  if (req.body.isActive !== undefined) {
    const isActive = req.body.isActive
    delete req.body.isActive

    if (currentUser.role !== 'master') {
      return next(createError(401, 'only master users can change the active state'))
    }

    update.isActive = isActive
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

  if (Object.keys(update).length) {
    update.lastUpdateDate = new Date()
  }

  const result = await collection.findOneAndUpdate({ _id }, { $set: update }, {
    projection: sensitiveInformationProjection
  })

  if (result.value._id.equals(currentUser._id)) {
    if (update.email || update.password) {
      delete req.session.user
      return res.end()
    }

    for (let i in update) {
      // This if statement is why we don't need to hide sensitive information
      if (req.session.user[i]) {
        req.session.user[i] = update[i]
      }
    }
  }

  for (let i in update) {
    if (i !== '_id' && sensitiveInformationProjection[i] !== 0) {
      result.value[i] = update[i]
    }
  }

  return res.send(result.value)
}
