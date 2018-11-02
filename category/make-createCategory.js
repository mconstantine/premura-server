module.exports = ({ getDb, createError }) => async (req, res, next) => {
  const name = req.body.name
  const description = req.body.description
  const allowsMultipleTerms = req.body.allowsMultipleTerms

  const collection = (await getDb()).collection('categories')
  const existingCategory = await collection.findOne({ name })

  if (existingCategory) {
    return next(createError(409, JSON.stringify(existingCategory)))
  }

  const category = { name, allowsMultipleTerms, terms: [] }

  if (description) {
    category.description = description
  }

  const result = await collection.insertOne(category)
  res.status(201).send({ _id: result.insertedId })
}
