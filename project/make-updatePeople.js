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

  const people = req.body.people
  const projectPeople = project.people
  const indexHash = [] // people index => project.people index

  {
    const errors = []

    people.forEach((person, peopleIndex) => {
      const projectIndex = projectPeople.findIndex(projectPerson => person._id == projectPerson._id)

      if (projectIndex < 0) {
        errors.push({
          location: 'body',
          param: `people[${peopleIndex}]`,
          value: person._id,
          msg: gt.gettext('User not found')
        })
      } else {
        indexHash[peopleIndex] = projectIndex
      }
    })

    if (errors.length) {
      return res.status(422).send({ errors })
    }
  }

  const doPeopleHaveBudget = people.filter(person => Number.isInteger(person.budget)).length

  if (project.budget && doPeopleHaveBudget) {
    const expected = project.budget
    const actual = people.reduce((res, person) => res + person.budget, 0)

    if (actual !== expected) {
      return next(createError(422, gt.gettext("People budgets don't add up")))
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
