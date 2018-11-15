module.exports = ({ getDb, ObjectID, createError, userCanReadProject }) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid project id'
      }]
    })
  }

  const collection = (await getDb()).collection('projects')
  const _id = new ObjectID(req.params.id)
  const project = await collection.findOne({ _id })

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(404, 'project not found'))
  }

  await collection.deleteOne({ _id })
  return res.end()
}
