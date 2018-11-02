module.exports = ({ getDb, cursorify }) => async (req, res) => {
  const collection = (await getDb()).collection('categories')
  const query = collection.find({})
  const options = await cursorify(req, res, query, { sort: { name: 1 } })

  return res.send(await collection.find({}, options).toArray())
}
