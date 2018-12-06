module.exports = ({
  getDb, ObjectID, createError, userCanReadProject
}) => async (req, res, next) => {
  const currentUser = req.session.user
  const activity = {
    title: req.body.title
  }

  if (req.body.description) {
    activity.description = req.body.description
  }

  const db = await getDb()

  const project_id = new ObjectID(req.body.project)
  const project = await db.collection('projects').findOne({
    _id: project_id
  })

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(currentUser, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  activity.project = project_id

  const recipient_id = new ObjectID(req.body.recipient)
  const recipient = await db.collection('users').findOne({
    _id: recipient_id
  })

  if (!recipient) {
    return next(createError(404, 'recipient not found'))
  }

  if (!userCanReadProject(recipient, project)) {
    return next(createError(401, 'recipient cannot access this project'))
  }

  activity.recipient = recipient_id

  if (!currentUser._id.equals(recipient_id) && currentUser.role === 'maker') {
    return next(createError(401, 'you cannot assign activities to other users'))
  }

  const timeFrom = new Date(req.body.timeFrom)
  const timeTo = new Date(req.body.timeTo)

  if (timeFrom >= timeTo) {
    return res.status(422).send({
      errors: [{
        location: 'body',
        param: 'timeTo',
        value: timeTo.toISOString(),
        message: 'timeTo should be rater than timeFrom'
      }]
    })
  }

  activity.timeFrom = timeFrom
  activity.timeTo = timeTo

  const otherActivities = await db.collection('activities').find({
    recipient: recipient_id,
    project: project_id
  }, {
    projection: {
      timeFrom: 1,
      timeTo: 1,
      budget: 1
    }
  }).toArray()

  const conflict = otherActivities.find(({ timeFrom, timeTo }) => {
    return (
      (timeFrom >= activity.timeFrom || timeTo >= activity.timeFrom) &&
      (timeFrom <= activity.timeTo || timeTo <= activity.timeTo)
    )
  })

  if (conflict) {
    return next(createError(409, {
      msg: 'an activity is already assigned for this time range',
      conflict
    }))
  }

  if (project.budget) {
    const getBudget = ({ timeFrom, timeTo }) => (timeTo - timeFrom) / (1000 * 60 * 60)
    const totalBudget = otherActivities.reduce(
      (res, activity) => res + getBudget(activity),
      0
    )
    const budget = getBudget(activity)
    const recipientPerson = project.people.find(({ _id }) => _id.equals(recipient_id))
    const recipientBudget = recipientPerson ? recipientPerson.budget : 0

    if (totalBudget + budget > recipientBudget) {
      return res.status(422).send({
        errors: [{
          location: 'body',
          param: 'timeTo',
          value: timeTo.toISOString(),
          message: 'there is no budget left'
        }]
      })
    }
  }

  activity.people = []
  activity.creationDate = new Date()
  activity.lastUpdateDate = new Date()

  const result = await db.collection('activities').insertOne(activity)
  return res.status(201).send({ _id: result.insertedId })
}
