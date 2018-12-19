/**
 * This path allows pagination. See cursorify.js.
 */
module.exports = ({
  getDb, cursorify, createFindFilters, sensitiveInformationProjection
}) => async (req, res) => {
  const collection = (await getDb()).collection('users')
  let filters = {}

  if (req.query.name) {
    filters.name = req.query.name
  }

  if (req.query.jobRole) {
    filters.jobRole = req.query.jobRole
  }

  filters = createFindFilters(filters)

  const query = collection.find(filters)
  const options = await cursorify(req, res, query, { projection: sensitiveInformationProjection })
  const users = await collection.find(filters, options).toArray()

  res.send(users)
}
