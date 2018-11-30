module.exports = ({
  getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
}) => async (req, res, next) => {
  const currentUser = req.session.user
  const db = await getDb()
  const _id = new ObjectID(req.params.id)
  const activity = await db.collection('activities').findOne({ _id })

  if (!activity) {
    return next(createError(404, 'activity not found'))
  }

  const project = await db.collection('projects').findOne({
    _id: new ObjectID(activity.project)
  })

  if (!userCanReadProject(currentUser, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  if (!currentUser._id.equals(activity.recipient) && currentUser.role === 'maker') {
    return next(createError(401, 'you cannot assign activities to other users'))
  }

  const peopleToRemove = req.body.people.map(_id => new ObjectID(_id))
  activity.people = activity.people.filter(_id => !peopleToRemove.find(r_id => r_id.equals(_id)))

  await db.collection('activities').updateOne({
    _id
  }, {
    $set: { people: activity.people }
  })

  return res.send(await getActivityFromDb(db, _id))
}
