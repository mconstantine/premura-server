module.exports = ({ sensitiveInformationProjection }) => async (db, _id) => {
  const projects = await db.collection('projects').aggregate([{
    $match: { _id }
  }, {
    $unwind: '$people'
  }, {
    $lookup: {
      from: 'users',
      localField: 'people._id',
      foreignField: '_id',
      as: 'users'
    }
  }, {
    $unwind: '$users'
  }, {
    $project: Object.keys(sensitiveInformationProjection).reduce((res, key) => Object.assign(
      res, { [`users.${key}`]: sensitiveInformationProjection[key] }
    ), {})
  }, {
    $group: {
      _id: '$_id',
      people: { $push: '$people' },
      users: { $push: '$users' },
      name: { $first: '$name' },
      description: { $first: '$description' },
      deadlines: { $first: '$deadlines' },
      status: { $first: '$status' },
      budget: { $first: '$budget' }
    }
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
