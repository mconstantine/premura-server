module.exports = ({ getDb, ObjectID, createError, gt, util }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, gt.gettext('Category not found')))
  }

  const terms = category.terms
  const updatedTerms = req.body.terms
  const notFoundTerms = []

  for (let { _id, name } of updatedTerms) {
    const term = terms.find(term => term._id.toString() === _id)

    if (!term) {
      notFoundTerms.push(_id)
      continue
    }

    term.name = name
  }

  if (notFoundTerms.length) {
    return next(createError(404, util.format(gt.ngettext(
      'Term not found (%s)',
      'Some terms were not found (%s)',
      notFoundTerms.length
    ), notFoundTerms.join(', '))))
  }

  await collection.updateOne({ _id: categoryId }, {
    $set: {
      terms,
      lastUpdateDate: new Date()
    }
  })

  return res.send(category)
}
