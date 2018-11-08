module.exports = ({ bcrypt, createError, getDb }) => async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const collection = (await getDb()).collection('users')
  const user = await collection.findOne({ email }, {
    projection: { email: 0, registrationDate: 0, lastLoginDate: 0 }
  })

  if (!user) {
    return next(createError(404, 'user not found'))
  }

  if (!await bcrypt.compare(password, user.password)) {
    return next(createError(401, 'invalid password'))
  }

  delete user.password

  await collection.updateOne({ email }, {
    $set: { lastLoginDate: new Date() }
  })

  req.session.user = user
  res.send(req.session.user)
}
