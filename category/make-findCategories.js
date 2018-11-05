module.exports = ({ getDb, find }) => async (req, res) => {
  if (!req.query.name) {
    return res.send([])
  }

  const collection = (await getDb()).collection('categories')
  const query = {}

  if (req.query.name) {
    query.name = req.query.name
  }

  const result = await (await find(collection, query)).toArray()

  res.send(result)
}
