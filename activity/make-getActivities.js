module.exports = ({
  getDb, ObjectID, cursorify, createFindFilters
}) => async (req, res) => {
  const currentUser = req.session.user
  const db = await getDb()
  const collection = db.collection('activities')
  let filters = {}

  if (req.query.title) {
    filters.title = req.query.title
  }

  filters = createFindFilters(filters)

  if (req.query.project) {
    filters.project = new ObjectID(req.query.project)
  }

  if (req.query.recipient) {
    filters.recipient = new ObjectID(req.query.recipient)
  }

  if (req.query.people) {
    const people = req.query.people.map(_id => new ObjectID(_id))
    filters.recipient = { $in: people.concat(filters.recipient || []) }
    filters.people = { $in: people }
  }

  if (req.query.before) {
    filters.timeTo = { $lte: new Date(req.query.before) }
  }

  if (req.query.after) {
    filters.timeFrom = { $gte: new Date(req.query.after) }
  }

  let aggregation = [{
    $match: filters
  }, {
    $lookup: {
      from: 'projects',
      localField: 'project',
      foreignField: '_id',
      as: 'extendedProject'
    }
  }, {
    $match: {
      'extendedProject.people._id': currentUser._id
    }
  }, {
    $project: {
      extendedProject: 0
    }
  }]

  aggregation = await cursorify(req, res, aggregation, {}, collection)

  return res.send(
    await collection
    .aggregate(aggregation)
    .toArray()
  )
}
