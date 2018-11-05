module.exports = ({ getDb, createFindFilters, cursorify }) => async (req, res) => {
  const collection = (await getDb()).collection('categories')
  let filters = {}

  if (req.query.name) {
    filters.name = req.query.name
  }

  filters = createFindFilters(filters)
  const query = collection.find(filters)
  const options = await cursorify(req, res, query, { sort: { name: 1 } })

  return res.send(await collection.find(filters, options).toArray())
}
