module.exports = ({ getDb, ObjectID, createError }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const termsToBeDeleted = req.body.terms.map(({ _id }) => _id)
  const remainingTerms = category.terms.filter(({ _id }) => !termsToBeDeleted.includes(_id.toString()))

  if (remainingTerms.length !== category.terms.length - termsToBeDeleted.length) {
    for (let _id of termsToBeDeleted) {
      if (!category.terms.find(term => term._id.equals(_id))) {
        return next(createError(404, `term ${_id} not found`))
      }
    }
  }

  await collection.updateOne({ _id: categoryId }, {
    $pull: { terms: { _id: { $in: termsToBeDeleted } } }
  })

  return res.send(Object.assign({}, category, { terms: remainingTerms }))
}
