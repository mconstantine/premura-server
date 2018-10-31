module.exports = ({ getDb, find, sensitiveInformationProjection }) => async (req, res) => {
  if (!req.query.name && !req.query.jobRole) {
    return res.send([])
  }

  const collection = (await getDb()).collection('users')
  const query = {}

  if (req.query.name) {
    query.name = req.query.name
  }

  if (req.query.jobRole) {
    query.jobRole = req.query.jobRole
  }

  const result = await (await find(collection, query, {
    projection: sensitiveInformationProjection
  })).toArray()

  res.send(result)
}
