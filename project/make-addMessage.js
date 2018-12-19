module.exports = ({ getDb, ObjectID, createError, userCanReadProject, gt }) => async (req, res, next) => {
  const currentUser = req.session.user
  const db = await getDb()
  const project_id = new ObjectID(req.params.id)
  const project = await db.collection('projects').findOne({ _id: project_id })

  if (!project) {
    return next(createError(404, gt.gettext('Project not found')))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  const content = req.body.content
  const creationDate = new Date()
  const lastUpdateDate = new Date()

  const message = {
    from: currentUser._id,
    project: project_id,
    creationDate,
    lastUpdateDate,
    content
  }

  const result = await db.collection('messages').insertOne(message)
  return res.send({ _id: result.insertedId })
}
