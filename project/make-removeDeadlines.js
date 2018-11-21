module.exports = ({
  getDb, ObjectID, createError, getProjectFromDb, userCanReadProject
}) => async (req, res, next) => {
  const _id = new ObjectID(req.params.id)
  const db = await getDb()
  const collection = db.collection('projects')
  const project = await collection.findOne({ _id })

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  const remainingDeadlines = project.deadlines.filter(
    deadline => !req.body.deadlines.includes(deadline.toISOString())
  )

  await collection.updateOne({ _id }, {
    $set: {
      deadlines: remainingDeadlines,
      lastUpdateDate: new Date()
    }
  })

  return res.send(await getProjectFromDb(db, _id))
}
