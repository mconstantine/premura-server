module.exports = ({ getDb, ObjectID, createError, gt }) => async (req, res, next) => {
  const currentUser = req.session.user
  const db = await getDb()
  const project_id = new ObjectID(req.params.id)
  const project = await db.collection('projects').findOne({ _id: project_id })

  if (!project) {
    return next(createError(404, gt.gettext('Project not found')))
  }

  const content = req.body.content
  const creationDate = new Date()
  const lastUpdateDate = new Date()

  const message = {
    _id: new ObjectID(),
    from: currentUser._id,
    creationDate,
    lastUpdateDate,
    content
  }

  await db.collection('projects').updateOne({ _id: project_id }, {
    $push: { messages: message }
  })

  return res.send(message)
}
