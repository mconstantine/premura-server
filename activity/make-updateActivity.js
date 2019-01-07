module.exports = ({
  getDb, ObjectID, createError, userCanReadProject, getActivityFromDb, gt
}) => async (req, res, next) => {
  const db = await getDb()
  const activity_id = new ObjectID(req.params.id)

  const activity = await db.collection('activities').findOne({
    _id: activity_id
  })

  if (!activity) {
    return next(createError(404, gt.gettext('Activity not found')))
  }

  const currentUser = req.session.user
  const update = {}

  if (req.body.title) {
    update.title = req.body.title
  }

  if (req.body.description) {
    update.description = req.body.description
  }

  let project, recipient

  if (req.body.project) {
    const project_id = new ObjectID(req.body.project)
    update.project = project_id

    project = await db.collection('projects').findOne({
      _id: project_id
    })

    if (!project) {
      return next(createError(404, gt.gettext('Project not found')))
    }
  } else {
    const project_id = new ObjectID(activity.project)

    project = await db.collection('projects').findOne({
      _id: project_id
    })
  }

  if (!userCanReadProject(currentUser, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  if (req.body.recipient) {
    const recipient_id = new ObjectID(req.body.recipient)
    update.recipient = recipient_id

    recipient = await db.collection('users').findOne({
      _id: recipient_id
    })

    if (!recipient) {
      return next(createError(404, gt.gettext('Recipient not found')))
    }

    if (!userCanReadProject(recipient, project)) {
      return next(createError(401, gt.gettext("Recipient can't access this project")))
    }
  } else {
    const recipient_id = new ObjectID(activity.recipient)

    recipient = await db.collection('users').findOne({
      _id: recipient_id
    })
  }

  if (!currentUser._id.equals(recipient._id) && currentUser.role === 'maker') {
    return next(createError(401, gt.gettext("You can't edit other user's activities")))
  }

  const timeFrom = new Date(req.body.timeFrom || activity.timeFrom)
  const timeTo = new Date(req.body.timeTo || activity.timeTo)

  if (req.body.timeFrom || req.body.timeTo) {
    if (timeFrom >= timeTo) {
      return res.status(422).send({
        errors: [{
          location: 'body',
          param: 'timeTo',
          value: timeTo.toISOString(),
          message: gt.gettext('"time to" should be later than "time from"')
        }]
      })
    }

    update.timeFrom = timeFrom
    update.timeTo = timeTo
  }

  const otherActivities = (
    await db.collection('activities').find({
      recipient: recipient._id,
      project: project._id
    }, {
      projection: {
        timeFrom: 1,
        timeTo: 1,
        budget: 1
      }
    })
    .toArray()
  )
  .filter(({ _id }) => !_id.equals(activity._id))

  const conflict = otherActivities.find(a => {
    return (
      (a.timeFrom > timeFrom || a.timeTo > timeFrom) &&
      (a.timeFrom < timeTo || a.timeTo < timeTo)
    )
  })

  if (conflict) {
    return next(createError(409, {
      msg: gt.gettext('An activity with this time range is already assigned'),
      conflict
    }))
  }

  if (project.budget) {
    const getBudget = ({ timeFrom, timeTo }) => (timeTo - timeFrom) / (1000 * 60 * 60)
    const totalBudget = otherActivities.reduce(
      (res, activity) => res + getBudget(activity),
      0
    )
    const budget = getBudget({ timeFrom, timeTo })
    const recipientPerson = project.people.find(({ _id }) => _id.equals(recipient._id))
    const recipientBudget = recipientPerson ? recipientPerson.budget : 0

    if (totalBudget + budget > recipientBudget) {
      return res.status(422).send({
        errors: [{
          location: 'body',
          param: 'timeTo',
          value: timeTo.toISOString(),
          message: gt.gettext('There is no budget left for this project')
        }]
      })
    }
  }

  if (Object.keys(update).length) {
    update.lastUpdateDate = new Date()

    await db.collection('activities').updateOne(
      { _id: activity_id },
      { $set: update }
    )
  }

  return res.send(await getActivityFromDb(db, activity_id))
}
