module.exports = ({ getDb, ObjectID, createError, gt }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, gt.gettext('Category not found')))
  }

  const termsToBeDeleted = req.body.terms.map(({ _id }) => _id)
  const remainingTerms = category.terms.filter(({ _id }) => !termsToBeDeleted.includes(_id.toString()))

  await collection.updateOne({ _id: categoryId }, {
    $set: {
      terms: remainingTerms,
      lastUpdateDate: new Date()
    }
  })

  return res.send(Object.assign({}, category, { terms: remainingTerms }))
}
