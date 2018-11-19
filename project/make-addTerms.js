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

  const categoriesHash = categories.reduce((res, category) => Object.assign(res, {
    [category._id.toString()]: category
  }), {})

  const errors = []
  const termsCategoriesHash = {} // term_id: category_id

  term_ids.forEach((term_id, index) => {
    const isTermFound = categories.reduce((res, category) => {
      const doesCategoryContainTerm = category.terms.find(({ _id }) => _id.equals(term_id))

      if (doesCategoryContainTerm) {
        termsCategoriesHash[term_id.toString()] = category._id.toString()
      }

      return res || doesCategoryContainTerm
    }, false)

    if (!isTermFound) {
      errors.push({
        location: 'body',
        param: `terms[${index}]`,
        value: term_id.toString(),
        msg: 'term not found'
      })
    }
  })

  if (errors.length) {
    return res.status(422).send({ errors })
  }

  for (let term_id in termsCategoriesHash) {
    const category_id = termsCategoriesHash[term_id]
    const category = categoriesHash[category_id]
    const term = category.terms.find(({ _id }) => _id.toString() === term_id)

    if (term.projects.find(_id => project_id.equals(_id))) {
      continue
    }

    term.projects.push(project_id)

    await categoriesCollection.updateOne({ _id: category._id }, {
      $set: { terms: category.terms }
    })
  }

  return res.send(await getProjectFromDb(db, project_id))
}
