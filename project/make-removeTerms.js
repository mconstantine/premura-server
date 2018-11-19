/**
 * WARNING: this actually assigns projects to terms, not the other way around.
 */

module.exports = ({
  getDb, ObjectID, createError, userCanReadProject, getProjectFromDb
}) => async (req, res, next) => {
  const db = await getDb()
  const projectsCollection = db.collection('projects')
  const project_id = new ObjectID(req.params.id)
  const project = await projectsCollection.findOne({ _id: project_id })

  if (!project) {
    return next(createError(404, 'project not found'))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, 'you cannot access this project'))
  }

  const term_ids = req.body.terms.map(_id => new ObjectID(_id))
  const categoriesCollection = db.collection('categories')
  const categories = await categoriesCollection.find({
    'terms._id': { $in: term_ids }
  }).toArray()

  categories.forEach(async category => {
    category.terms.forEach(term => {
      const index = term.projects.findIndex(_id => _id.equals(project._id))

      if (index < 0) {
        return
      }

      term.projects.splice(index, 1)
    })

    await categoriesCollection.updateOne({ _id: category._id }, {
      $set: { terms: category.terms }
    })
  })

  return res.send(await getProjectFromDb(db, project_id))
}
