module.exports = ({ sensitiveInformationProjection }) => async (db, _id) => {
  const projects = await db.collection('projects').aggregate([{
    $match: { _id }
  }, {
    $lookup: {
      from: 'users',
      localField: 'people._id',
      foreignField: '_id',
      as: 'users'
    }
  }, {
    $project: Object.keys(sensitiveInformationProjection).reduce((res, key) => Object.assign(
      res, { [`users.${key}`]: sensitiveInformationProjection[key] }
    ), {})
  }])
  .toArray()

  if (!projects.length) {
    return false
  }

  const project = projects[0]
  const categories = await db.collection('categories').aggregate([{
    $unwind: '$terms'
  }, {
    $match: {
      'terms.projects': project._id
    }
  }, {
    $group: {
      _id: '$_id',
      terms: { $push: '$terms' },
      name: { $first: '$name' },
      description: { $first: '$description' },
      allowsMultipleTerms: { $first: '$allowsMultipleTerms' }
    }
  }])
  .toArray()

  project.categories = categories
  return project
}
