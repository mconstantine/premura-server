module.exports = ({
  getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
}) => async (req, res, next) => {
  const _id = new ObjectID(req.params.id)
  const db = await getDb()
  const collection = db.collection('projects')
  const project = await collection.findOne({ _id })

  if (!project) {
    return next(createError(404, gt.gettext('Project not found')))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  let deadlines = req.body.deadlines.map(deadline => new Date(deadline))
  const errors = []
  const yesterday = new Date()

  yesterday.setTime(yesterday.getTime() - 1000 * 60 * 60 * 24)

  deadlines.forEach((deadline, index) => {
    if (deadline > yesterday) {
      return
    }

    errors.push({
      location: 'body',
      param: `deadlines[${index}]`,
      value: deadline.toISOString(),
      msg: gt.gettext('Deadlines should be today or in the future')
    })
  })

  if (errors.length) {
    return res.status(422).send({ errors })
  }

  const projectDeadlinesStrings = project.deadlines.map(deadline => deadline.toISOString())
  const uniqueDeadlines = deadlines.filter(
    deadline => !projectDeadlinesStrings.includes(deadline.toISOString())
  )

  deadlines = project.deadlines.concat(uniqueDeadlines)

  await collection.updateOne({ _id }, {
    $set: {
      deadlines,
      lastUpdateDate: new Date()
    }
  })

  return res.send(await getProjectFromDb(db, _id))
}
