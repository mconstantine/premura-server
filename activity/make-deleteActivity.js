module.exports = ({
  getDb, ObjectID, createError, userCanReadProject
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

  const currentUser = req.session.user
  const db = await getDb()
  const activity_id = new ObjectID(req.params.id)
  const activity = await db.collection('activities').findOne({ _id: activity_id })

  if (!activity) {
    return next(createError(404, 'activity not found'))
  }

  const project_id = new ObjectID(activity.project)
  const project = await db.collection('projects').findOne({ _id: project_id })

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  if (!currentUser._id.equals(activity.recipient) && currentUser.role === 'maker') {
    return next(createError(401, "you cannot delete other user's activities"))
  }

  await db.collection('activities').deleteOne({ _id: activity_id })
  return res.end()
}
