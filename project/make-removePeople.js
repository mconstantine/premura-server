module.exports = ({
  getDb, ObjectID, createError, getProjectFromDb, userCanReadProject
}) => async (req, res, next) => {
  const _id = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('projects')
  const project = await collection.findOne({ _id })

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(404, 'project not found'))
  }

  {
    const peopleIDsStrings = req.body.people.map(({ _id }) => _id)
    const projectPeopleIDsStrings = project.people.map(({ _id }) => _id.toString())

    peopleIDsStrings.forEach(personIDString => {
      const index = projectPeopleIDsStrings.indexOf(personIDString)

      if (index >= 0) {
        projectPeopleIDsStrings.splice(index, 1)
        project.people.splice(index, 1)
      }
    })
  }

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
    $set: { people: project.people }
  })

  const projectFromDb = await getProjectFromDb(collection, _id)
  return res.send(projectFromDb)
}
