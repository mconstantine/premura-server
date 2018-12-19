module.exports = ({
  getDb, ObjectID, cursorify, createFindFilters, sensitiveInformationProjection
}) => async (req, res) => {
  const project_id = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('messages')
  let filters = {}

  if (req.query.content) {
    filters.content = req.query.content
  }

  filters = createFindFilters(filters)

  const projectFilter = {
    project: project_id
  }

  if (Object.keys(filters).length) {
    filters = {
      $and: [projectFilter, filters]
    }
  } else {
    filters = projectFilter
  }

  let aggregation = [{
    $match: filters
  }]

  aggregation.push({
    $lookup: {
      from: 'users',
      localField: 'from',
      foreignField: '_id',
      as: 'from'
    }
  }, {
    $project: Object.keys(sensitiveInformationProjection).reduce((res, key) => Object.assign(
      res, { [`from.${key}`]: sensitiveInformationProjection[key] }
    ), {})
  })

  aggregation = await cursorify(req, res, aggregation, {}, collection)
  const messages = await collection.aggregate(aggregation).toArray()

  return res.send(messages)
}
