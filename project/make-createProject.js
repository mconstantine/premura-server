module.exports = ({ getDb, createError, ObjectID }) => async (req, res, next) => {
  const db = await getDb()
  const name = req.body.name
  const description = req.body.description
  const budget = req.body.budget
  const status = req.body.status

  const project = { name }

  if (description) {
    project.description = description
  }

  if (budget) {
    project.budget = parseInt(budget)
  }

  const creatorUser = {
    _id: req.session.user._id
  }

  if (project.budget) {
    creatorUser.budget = project.budget
  }

  project.people = [creatorUser]
  project.deadlines = []
  project.status = status || 'opened'

  const result = await db.collection('projects').insertOne(project)
  res.status(201).send({ _id: result.insertedId })
}
