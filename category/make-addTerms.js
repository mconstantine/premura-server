module.exports = ({ getDb, ObjectID, createError }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const terms = req.body.terms.map(term => ({
    _id: new ObjectID(),
    name: term.name,
    projects: []
  }))

  await collection.updateOne({ _id: categoryId }, {
    $set: {
      lastUpdateDate: new Date()
    },
    $push: { terms: { $each: terms } }
  })

  category.terms = category.terms.concat(terms)
  return res.send(category)
}
