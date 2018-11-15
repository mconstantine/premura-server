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

  const query = collection.find(filters)
  const options = await cursorify(req, res, query)
  const projects = await collection.find(filters, options).toArray()

  return res.send(projects)
}
