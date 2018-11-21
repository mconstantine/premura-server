module.exports = ({ getDb, ObjectID, createError }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const data = req.body
  const update = {}

  if (data.name) {
    update.name = data.name
  }

  if (data.description) {
    update.description = data.description
  }

  if (data.allowsMultipleTerms !== undefined) {
    update.allowsMultipleTerms = data.allowsMultipleTerms
  }

  if (Object.keys(update).length) {
    update.lastUpdateDate = new Date()

    await collection.updateOne({ _id: categoryId }, {
      $set: update
    })
  }

  return res.send(Object.assign(category, update))
}
