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

  const people = req.body.people
  const projectPeople = project.people
  const indexHash = [] // people index => project.people index

  {
    const peopleNotFound = []

    people.forEach((person, peopleIndex) => {
      const projectIndex = projectPeople.findIndex(projectPerson => person._id == projectPerson._id)

      if (projectIndex < 0) {
        peopleNotFound.push(person._id)
      } else {
        indexHash[peopleIndex] = projectIndex
      }
    })

    if (peopleNotFound.length) {
      return next(createError(404, `people not found: ${peopleNotFound.join(', ')}`))
    }
  }

  const doPeopleHaveBudget = people.reduce(
    (res, person) => res || Number.isInteger(person.budget),
    false
  )

  if (project.budget && doPeopleHaveBudget) {
    const expected = project.budget
    const actual = people.reduce((res, person) => res + person.budget, 0)

    if (actual !== expected) {
      return next(createError(422, "people budgets don't add up"))
    }

    indexHash.forEach((peopleIndex, projectIndex) => {
      project.people[projectIndex] = Object.assign(project.people[projectIndex], {
        budget: people[peopleIndex].budget
      })
    })
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
