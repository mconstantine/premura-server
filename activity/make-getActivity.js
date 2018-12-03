module.exports = ({
  getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
}) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid activity id'
      }]
    })
  }

  const db = await getDb()
  const activity_id = new ObjectID(req.params.id)
  const activity = await getActivityFromDb(db, activity_id)

  if (!activity) {
    return next(createError(404, 'activity not found'))
  }

  const project_id = activity.project._id
  const project = await db.collection('projects').findOne({ _id: project_id })

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  return res.send(activity)
}
