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

  let people = req.body.people.map(({ _id }) => ({ _id: new ObjectID(_id) }))
  const peopleIDs = people.map(({ _id }) => _id)
  const peopleFromDB = await db
    .collection('users')
    .find(
      { _id: { $in: peopleIDs } },
      { projection: { _id: 1, isActive: 1 } }
    )
    .toArray()

  const peopleIDsFromDB = peopleFromDB.map(({ _id }) => _id)

  if (peopleIDsFromDB.length !== peopleIDs.length) {
    for (let _id of peopleIDs) {
      if (!peopleIDsFromDB.includes(_id)) {
        return next(createError(404, `user ${_id} not found`))
      }
    }
  }

  const errors = []

  peopleFromDB.forEach(user => {
    if (!user.isActive) {
      errors.push({
        location: 'body',
        param: 'people[' + peopleIDs.findIndex(_id => _id.equals(user._id)) + ']',
        value: user._id.toString(),
        msg: 'user not active'
      })
    }
  })

  if (errors.length) {
    return res.status(422).send({ errors })
  }

  { // To be sure that peopleIDsStrings and projectPeopleIDsStrings will not be used anymore
    // Array.indexOf seems not to work with ObjectIDs
    const peopleIDsStrings = peopleIDs.map(x => x.toString())
    const projectPeopleIDsStrings = project.people.map(({ _id }) => _id.toString())

    for (let projectPersonIDString of projectPeopleIDsStrings) {
      const index = peopleIDsStrings.indexOf(projectPersonIDString.toString())

      if (index >= 0) {
        peopleIDsStrings.splice(index, 1)
        peopleIDs.splice(index, 1)
        people.splice(index, 1)
      }
    }
  }

  people = project.people.concat(people)

  if (project.budget) {
    const budgetPerPerson = project.budget / people.length
    const intBudgetPerPerson = Math.floor(budgetPerPerson)

    people = people.map(person => Object.assign(person, { budget: intBudgetPerPerson }))

    if (budgetPerPerson > intBudgetPerPerson) {
      people[0].budget++
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
