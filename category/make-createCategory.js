module.exports = ({ getDb }) => async (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const allowsMultipleTerms = req.body.allowsMultipleTerms

  const category = { name, allowsMultipleTerms }

  if (description) {
    category.description = description
  }

  const result = await (await getDb()).collection('categories').insertOne(category)
  res.status(201).send({ _id: result.insertedId })
}
