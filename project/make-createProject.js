module.exports = ({ getDb, createError, ObjectID }) => async (req, res, next) => {
  const db = await getDb()
  const name = req.body.name
  const description = req.body.description
  const people = req.body.people
  const budget = req.body.budget
  const deadlines = req.body.deadlines

  const project = { name }

  if (description) {
    project.description = description
  }

  if (people && people.length) {
    const peopleIds = people.map(({ _id }) => new ObjectID(_id))
    const users = await db.collection('users').find({
      _id: { $in: peopleIds }
    }, {
      projection: { _id: 1 }
    }).toArray()

    if (users.length < people.length) {
      const usersIds = users.map(({ _id }) => _id.toString())
      const notFound = []

      peopleIds.forEach(_id => !usersIds.includes(_id.toString()) && notFound.push(_id))

      if (notFound.length) {
        return next(createError(404, `users not found: ${notFound.join(', ')}`))
      }
    }

    project.people = people
  } else {
    project.people = []
  }

  if (!project.people.find(({ _id }) => _id === req.session.user._id.toString())) {
    project.people = project.people
    .map(person => {
      delete person.budget
      return person
    })

    project.people.push({ _id: req.session.user._id })
  }

  if (budget) {
    project.budget = parseInt(budget)

    if (!people.reduce((res, person) => res || Number.isInteger(person.budget), false)) {
      const budgetPerPerson = project.budget / project.people.length
      const intBudgetPerPerson = Math.floor(budgetPerPerson)

      project.people = project.people.map(person => Object.assign(person, {
        budget: intBudgetPerPerson
      }))

      if (budgetPerPerson > intBudgetPerPerson) {
        project.people[0].budget++
      }
    }
  }

  project.deadlines = deadlines || []

  const result = await db.collection('projects').insertOne(project)
  res.status(201).send({ _id: result.insertedId })
}
