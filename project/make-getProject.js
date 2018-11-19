module.exports = ({
  getDb, ObjectID, createError, getProjectFromDb, userCanReadProject
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
  const project = await getProjectFromDb(db, _id)

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  return res.send(project)
}
