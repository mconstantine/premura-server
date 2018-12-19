module.exports = ({ getDb, ObjectID, createError, gt }) => async (req, res, next) => {
  const db = await getDb()
  const message_id = new ObjectID(req.params.messageId)
  const message = await db.collection('messages').findOne({ _id: message_id })

  if (!message) {
    return next(createError(404, gt.gettext('Message not found')))
  }

  if (!message.from.equals(req.session.user._id)) {
    return next(createError(401, gt.gettext("You can't edit another user's message")))
  }

  const project_id = new ObjectID(req.params.id)

  if (!message.project.equals(project_id)) {
    return next(createError(422, {
      location: 'params',
      param: 'id',
      value: req.params.id,
      msg: gt.gettext("Your message is not part of this project's conversation")
    }))
  }

  const content = req.body.content
  message.content = content

  await db.collection('messages').updateOne({
    _id: message_id
  }, {
    $set: {
      content,
      lastUpdateDate: new Date()
    }
  })

  return res.send(message)
}
