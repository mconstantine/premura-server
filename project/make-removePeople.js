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

  req.body.people.forEach(person => {
    person._id = new ObjectID(person._id)
  })

  project.people = project.people.filter(
    person => req.body.people.find(personToRemove => person._id.equals(personToRemove._id))
  )

  if (!project.people.length) {
    return next(createError(422, 'a project cannot be assigned to no one'))
  }

  if (project.budget) {
    const budgetPerPerson = project.budget / project.people.length
    const budgetPerPersonInt = Math.floor(budgetPerPerson)

    project.people = project.people.map(person => Object.assign(person, { budget: budgetPerPersonInt }))

    if (budgetPerPerson > budgetPerPersonInt) {
      project.people[0].budget++
    }
  }

  await collection.updateOne({ _id }, {
    $set: {
      people: project.people,
      lastUpdateDate: new Date()
    }
  })

  const projectFromDb = await getProjectFromDb(db, _id)
  return res.send(projectFromDb)
}
