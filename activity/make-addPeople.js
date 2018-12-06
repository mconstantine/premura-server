module.exports = ({
  getDb, ObjectID, createError, userCanReadProject, getActivityFromDb, gt, util
}) => async (req, res, next) => {
  const currentUser = req.session.user
  const db = await getDb()
  const activity_id = new ObjectID(req.params.id)
  const activity = await db.collection('activities').findOne({
    _id: activity_id
  })

  if (!activity) {
    return next(createError(404, gt.gettext('Activity not found')))
  }

  const recipient = await db.collection('users').findOne({
    _id: activity.recipient
  })

  if (!currentUser._id.equals(recipient._id) && currentUser.role === 'maker') {
    return next(createError(401, gt.gettext("You can't assign activities to other users")))
  }

  const project = await db.collection('projects').findOne({
    _id: activity.project
  })

  if (!userCanReadProject(currentUser, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  const peopleIds = req.body.people
  .filter((value, index, self) => self.indexOf(value) === index) // removes duplicates
  .map(id => new ObjectID(id))
  .filter(_id => !_id.equals(activity.recipient))
  .filter(_id => !activity.people.find(person_id => _id.equals(person_id)))

  if (peopleIds.length) {
    const notFoundUsers = []
    const people = await Promise.all(peopleIds.map(async _id => {
      const user = await db.collection('users').findOne({ _id })

      if (!user) {
        notFoundUsers.push(_id.toString())
      }

      return user
    }))

    if (notFoundUsers.length) {
      return next(createError(404, util.format(gt.ngettext(
        'User not found (%s)',
        'Some users were not found (%s)',
        notFoundUsers.length
      ), notFoundUsers.join(', '))))
    }

    for (let user of people) {
      if (!userCanReadProject(user, project)) {
        return next(createError(401, util.format(
          gt.gettext('%s cannot access this project'),
          user.name
        )))
      }
    }

    activity.people = activity.people.concat(people.map(({ _id }) => _id))

    await db.collection('activities').updateOne({
      _id: activity._id
    }, {
      $set: {
        people: activity.people,
        lastUpdateDate: new Date()
      }
    })
  }

  return res.send(await getActivityFromDb(db, activity_id))
}
