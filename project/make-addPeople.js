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

  let people = req.body.people.map(
    person => Object.assign({}, person, { _id: new ObjectID(person._id) })
  )

  const peopleIDs = people.map(({ _id }) => _id)
  const peopleFromDB = await db
    .collection('users')
    .find(
      { _id: { $in: peopleIDs } },
      { projection: { _id: 1, isActive: 1 } }
    )
    .toArray()

  const peopleIDsFromDB = peopleFromDB.map(({ _id }) => _id)
  let errors = []

  if (peopleIDsFromDB.length !== peopleIDs.length) {
    peopleIDs.forEach((_id, index) => {
      if (!peopleIDsFromDB.includes(_id)) {
        errors.push({
          location: 'body',
          param: `people[${index}]`,
          value: _id.toString(),
          msg: gt.gettext('User not found')
        })
      }
    })
  }

  if (errors.length) {
    return res.status(422).send({ errors })
  }

  errors = []

  peopleFromDB.forEach(user => {
    if (!user.isActive) {
      errors.push({
        location: 'body',
        param: 'people[' + peopleIDs.findIndex(_id => _id.equals(user._id)) + ']',
        value: user._id.toString(),
        msg: gt.gettext('User not active')
      })
    }
  })

  if (errors.length) {
    return res.status(422).send({ errors })
  }

  people = people.filter(
    person => !project.people.find(projectPerson => person._id.equals(projectPerson._id))
  )

  people = project.people.concat(people)

  if (project.budget) {
    const budgetPerPerson = project.budget / people.length
    const intBudgetPerPerson = Math.round(budgetPerPerson)

    people = people.map(person => Object.assign(person, { budget: intBudgetPerPerson }))

    if (budgetPerPerson !== intBudgetPerPerson) {
      people[0].budget = Math.abs(intBudgetPerPerson * (people.length - 1) - project.budget)
    }
  }

  project.people = people
  await collection.updateOne({ _id }, {
    $set: {
      people,
      lastUpdateDate: new Date()
    }
  })

  return res.send(await getProjectFromDb(db, _id))
}
