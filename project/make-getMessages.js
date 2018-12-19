module.exports = ({ getDb, ObjectID, cursorify, createFindFilters }) => async (req, res) => {
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

  const query = collection.find(filters)
  const options = await cursorify(req, res, query)
  const messages = await collection.find(filters, options).toArray()

  return res.send(messages)
}
