module.exports = ({ sensitiveInformationProjection }) => async (collection, _id) => {
  const projects = await collection.aggregate([{
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

  return projects[0]
}
