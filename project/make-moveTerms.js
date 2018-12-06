module.exports = ({
  getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
}) => async (req, res, next) => {
  const db = await getDb()
  const _id = new ObjectID(req.params.id)
  const projectsCollection = db.collection('projects')
  const project = await projectsCollection.findOne({ _id })

  if (!project) {
    return next(createError(404, gt.gettext('Project not found')))
  }

  if (!userCanReadProject(req.session.user, project)) {
    return next(createError(401, gt.gettext("You can't access this project")))
  }

  const destinationProject_id = new ObjectID(req.body.destination)
  const destinationProject = await projectsCollection.findOne({ _id: destinationProject_id })

  if (!destinationProject) {
    return next(createError(404, gt.gettext('Destination project not found')))
  }

  if (!userCanReadProject(req.session.user, destinationProject)) {
    return next(createError(401, gt.gettext("You can't access the destination project")))
  }

  const categoriesCollection = db.collection('categories')
  const categories = await categoriesCollection.find({
    'terms.projects': project._id
  }).toArray()

  categories.forEach(async category => {
    category.terms.forEach(term => {
      term.projects.forEach((project_id, index) => {
        if (project_id.equals(project._id)) {
          term.projects[index] = destinationProject._id
        }
      })
    })

    await categoriesCollection.updateOne({
      _id: category._id
    }, {
      $set: { terms: category.terms }
    })
  })

  await projectsCollection.updateOne({ _id }, {
    $set: {
      lastUpdateDate: new Date()
    }
  })

  await projectsCollection.updateOne({ _id: destinationProject_id }, {
    $set: {
      lastUpdateDate: new Date()
    }
  })

  return res.send(await getProjectFromDb(db, destinationProject._id))
}
