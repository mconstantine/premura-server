module.exports = ({
  getDb, createError, ObjectID, sensitiveInformationProjection, gt
}) => async (req, res, next) => {
  let _id = req.params.id

  if (req.params.id === 'me') {
    _id = req.session.user._id
  } else if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: gt.gettext('Invalid user ID')
      }]
    })
  } else {
    _id = new ObjectID(req.params.id)
  }

  const user = await (await getDb()).collection('users').findOne({ _id }, {
    projection: sensitiveInformationProjection
  })

  if (!user) {
    return next(createError(404, gt.gettext('User not found')))
  }

  res.send(user)
}
