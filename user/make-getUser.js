module.exports = ({
  getDb, createError, ObjectID, sensitiveInformationProjection
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

  let _id

  try {
    _id = new ObjectID(req.params.id)
  } catch (ex) {
    return next(createError(404, 'user not found'))
  }

  const user = await (await getDb()).collection('users').findOne({ _id }, {
    projection: sensitiveInformationProjection
  })

  if (!user) {
    return next(createError(404, 'user not found'))
  }

  res.send(user)
}
