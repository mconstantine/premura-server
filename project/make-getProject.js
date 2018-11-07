module.exports = ({
  getDb, ObjectID, createError, getProjectFromDB
}) => async (req, res, next) => {
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

  const _id = new ObjectID(req.params.id)
  const db = await getDb()
  const collection = db.collection('projects')
  const project = await getProjectFromDB(collection, _id)

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  return res.send(project)
}
