module.exports = ({ getDb, ObjectID, createError }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const terms = category.terms
  const updatedTerms = req.body.terms

  for (let { _id, name } of updatedTerms) {
    const term = terms.find(term => term._id.toString() === _id)

    if (!term) {
      return next(createError(404, `term ${_id} not found`))
    }

    term.name = name
  }

  await collection.updateOne({ _id: categoryId }, {
    $set: {
      terms,
      lastUpdateDate: new Date()
    }
  })

  return res.send(category)
}
