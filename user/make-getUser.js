module.exports = ({ getDb, createError, ObjectID }) => async (req, res, next) => {
  if (!req.params.id) {
    return next(createError(400, 'missing required parameter id'))
  }

  let _id

  try {
    _id = new ObjectID(req.params.id)
  } catch (ex) {
    return next(createError(404, 'user not found'))
  }

  const user = await (await getDb()).collection('users').findOne({ _id }, {
    projection: { email: 0, password: 0, registrationDate: 0, lastLoginDate: 0 }
  })

  if (!user) {
    return next(createError(404, 'user not found'))
  }

  res.send(user)
}
