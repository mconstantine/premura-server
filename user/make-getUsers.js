/**
 * This path allows pagination. See cursorify.js.
 */
module.exports = ({ getDb, cursorify, sensitiveInformationProjection }) => async (req, res) => {
  const collection = (await getDb()).collection('users')
  const query = collection.find({})
  const options = await cursorify(req, res, query, { projection: sensitiveInformationProjection })
  const users = await collection.find({}, options).toArray()

  res.send(users)
}
