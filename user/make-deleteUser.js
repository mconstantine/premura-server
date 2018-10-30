module.exports = ({ createError, ObjectID, getDb, roles }) => async (req, res, next) => {
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

  if (roles.indexOf(req.session.user.role) <= roles.indexOf(user.role)) {
    return next(createError(401, 'only a user with a higher role can delete a user'))
  }

  await collection.deleteOne({ _id })

  res.end()
}
