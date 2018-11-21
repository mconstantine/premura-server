module.exports = ({ getDb, ObjectID, createError, userCanReadProject }) => async (req, res, next) => {
  const _id = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('projects')
  const project = await collection.findOne({ _id })

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  const update = {}
  const name = req.body.name
  const description = req.body.description
  const budget = req.body.budget
  const status = req.body.status

  if (name) {
    project.name = name
    update.name = name
  }

  if (description) {
    project.description = description
    update.description = description
  }

  if (budget) {
    project.budget = budget
    update.budget = parseInt(budget)

    const doPeopleHaveBudget = project.people.reduce(
      (res, person) => res || Number.isInteger(person.budget), false
    )

    const isBudgetOk = doPeopleHaveBudget && (() => {
      const expected = update.budget
      const actual = project.people.reduce((res, person) => res + person.budget, 0)
      return expected === actual
    })()

    if (!isBudgetOk) {
      const budgetPerPerson = update.budget / project.people.length
      const intBudgetPerPerson = Math.floor(budgetPerPerson)

      project.people = project.people.map(person => Object.assign(person, { budget: intBudgetPerPerson }))

      if (budgetPerPerson > intBudgetPerPerson) {
        project.people[0].budget++
      }

      update.people = project.people
    }
  }

  if (status) {
    project.status = status
    update.status = status
  }

  if (Object.keys(update).length) {
    update.lastUpdateDate = new Date()
    await collection.updateOne({ _id }, { $set: update })
  }

  return res.send(project)
}
