module.exports = ({
  getDb, ObjectID, createError, sensitiveInformationProjection, schema
}) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid project id'
      }]
    })
  }

  const _id = new ObjectID(req.params.id)
  const db = await getDb()
  const collection = db.collection('projects')
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
    $group: Object.assign({
      _id: '$_id',
      people: { $push: '$people' },
      users: { $push: '$users' },
    }, schema.reduce((res, key) => {
      if (key !== '_id' && key !== 'people') {
        res[key] = { $first: '$' + key }
      }

      return res
    }, {}))
  }])
  .toArray()

  if (!projects.length) {
    return next(createError(404, 'project not found'))
  }

  return res.send(projects[0])
}
