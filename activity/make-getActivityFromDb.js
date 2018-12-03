module.exports = ({ sensitiveInformationProjection }) => async (db, _id) => {
  const activities = await db.collection('activities').aggregate([{
    $match: { _id }
  }, {
    $lookup: {
      from: 'projects',
      localField: 'project',
      foreignField: '_id',
      as: 'project'
    }
  }, {
    $unwind: '$project'
  }, {
    $lookup: {
      from: 'users',
      localField: 'project.people._id',
      foreignField: '_id',
      as: 'project.users'
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'people',
      foreignField: '_id',
      as: 'people'
    }
  }, {
    $project: Object
    .keys(sensitiveInformationProjection)
    .reduce(
      (res, key) => Object.assign(
        res, { [`people.${key}`]: sensitiveInformationProjection[key] }
      ),
      {}
    )
  }, {
    $project: Object
    .keys(sensitiveInformationProjection)
    .reduce(
      (res, key) => Object.assign(
        res, { [`project.users.${key}`]: sensitiveInformationProjection[key] }
      ),
      {}
    )
  }, {
    $lookup: {
      from: 'users',
      localField: 'recipient',
      foreignField: '_id',
      as: 'recipient'
    }
  }, {
    $unwind: '$recipient'
  }, {
    $project: Object
    .keys(sensitiveInformationProjection)
    .reduce(
      (res, key) => Object.assign(
        res, { [`recipient.${key}`]: sensitiveInformationProjection[key] }
      ),
      {}
    )
  }])
  .toArray()

  if (!activities.length) {
    return false
  }

  const activity = activities[0]
  const categories = await db.collection('categories').aggregate([{
    $unwind: '$terms'
  }, {
    $match: {
      'terms.projects': activity.project._id
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

  activity.project.categories = categories
  return activity
}
