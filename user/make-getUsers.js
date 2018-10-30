/**
 * This path allows pagination. See cursorify.js.
 */
module.exports = ({ getDb, cursorify }) => async (req, res) => {
  const collection = (await getDb()).collection('users')
  const query = collection.find({})
  const options = await cursorify(req, res, query, {
    projection: { password: 0, email: 0, registrationDate: 0, lastLoginDate: 0 }
  })
  const users = await collection.find({}, options).toArray()

  res.send(users)
}
