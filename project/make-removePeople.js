module.exports = ({
  getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
}) => async (req, res, next) => {
  const _id = new ObjectID(req.params.id)
  const db = await getDb()
  const project = await db.collection('projects').findOne({ _id })

  if (!project) {
    return next(createError(404, gt.gettext('Project not found')))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  const people = req.body.people.map(person =>
    Object.assign({}, person, { _id: new ObjectID(person._id) })
  )

  const peopleToRemove = []

  project.people = project.people.filter(projectPerson => {
    const person = people.find(person => projectPerson._id.equals(person._id))

    if (person) {
      peopleToRemove.push(person)
    }

    return !person
  })

  if (!project.people.length) {
    return next(createError(422, gt.gettext("A project can't be assigned to no one")))
  }

  if (project.budget) {
    const budgetPerPerson = project.budget / project.people.length
    const budgetPerPersonInt = Math.floor(budgetPerPerson)

    project.people = project.people.map(person => Object.assign(person, { budget: budgetPerPersonInt }))

    if (budgetPerPerson > budgetPerPersonInt) {
      project.people[0].budget++
    }
  }

  await db.collection('projects').updateOne({ _id }, {
    $set: {
      people: project.people,
      lastUpdateDate: new Date()
    }
  })

  await Promise.all(peopleToRemove.map(async ({ _id }) => {
    await db.collection('activities').deleteMany({ recipient: _id })
    await db.collection('activities').updateMany({
      people: _id
    }, {
      $pull: {
        people: _id
      }
    })
  }))

  const projectFromDb = await getProjectFromDb(db, _id)
  return res.send(projectFromDb)
}
