/**
 * This path allows pagination. See cursorify.js.
 */
module.exports = ({ getDb, cursorify }) => async (req, res) => {
  const collection = (await getDb()).collection('users')
  const options = await cursorify(req, res, collection, { projection: { password: 0 } })
  const users = await collection.find({}, options).toArray()

  res.send(users)
}
