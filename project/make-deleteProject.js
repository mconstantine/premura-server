module.exports = ({ getDb, ObjectID, createError, userCanReadProject, gt }) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: gt.gettext('Invalid project ID')
      }]
    })
  }

  const db = await getDb()
  const projectsCollection = db.collection('projects')
  const _id = new ObjectID(req.params.id)
  const project = await projectsCollection.findOne({ _id })

  if (!project) {
    return next(createError(404, gt.gettext('Project not found')))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  const categoriesCollection = db.collection('categories')
  const categories = await categoriesCollection.find({
    'terms.projects': project._id
  }).toArray()

  categories.forEach(async category => {
    category.terms.forEach(term => {
      term.projects = term.projects.reduce((res, _id) => {
        if (_id.equals(project._id)) {
          return res
        }

        return res.concat([_id])
      }, [])
    })

    await categoriesCollection.updateOne({ _id: category._id }, {
      $set: { terms: category.terms }
    })
  })

  await projectsCollection.deleteOne({ _id })
  return res.end()
}
