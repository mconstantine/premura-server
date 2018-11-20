module.exports = ({ getDb, ObjectID, cursorify, createFindFilters }) => async (req, res) => {
  const collection = (await getDb()).collection('projects')
  let filters = {}

  if (req.query.name) {
    filters.name = req.query.name
  }

  filters = createFindFilters(filters)

  if (req.query.status) {
    filters.status = req.query.status
  }

  if (req.query.people) {
    filters['people._id'] = {
      $in: req.query.people.map(_id => new ObjectID(_id))
    }
  }

  if (req.query.before) {
    filters.deadlines = { $lte: new Date(req.query.before) }
  }

  if (req.query.after) {
    filters.deadlines = { $gte: new Date(req.query.after) }
  }

  filters = {
    $and: [
      { 'people._id': { $all: [new ObjectID(req.session.user._id)] } },
      filters
    ]
  }

  let aggregation = [{
    $match: filters
  }]

  aggregation.push({
    $lookup: {
      from: 'categories',
      localField: '_id',
      foreignField: 'terms.projects',
      as: 'categories'
    }
  })

  if (req.query.categories) {
    const categories = req.query.categories.map(_id => new ObjectID(_id))

    aggregation.push({
      $match: {
        'categories._id': { $in: categories }
      }
    })
  }

  if (req.query.terms) {
    const terms = req.query.terms.map(_id => new ObjectID(_id))

    aggregation.push({
      $match: {
        'categories.terms._id': { $in: terms }
      }
    })
  }

  aggregation = await cursorify(req, res, aggregation, {}, collection)
  const projects = await collection.aggregate(aggregation).toArray()

  return res.send(projects)
}
