module.exports = ({ getDb, ObjectID, createError }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const terms = category.terms
  const newTerms = req.body.terms.map(term => ({
    _id: new ObjectID(),
    name: term.name,
    projects: []
  }))

  for (let { name } of newTerms) {
    const alreadyExistingTerm = terms.find(term => term.name === name)

    if (alreadyExistingTerm) {
      return next(createError(409, JSON.stringify(alreadyExistingTerm)))
    }
  }

  await collection.updateOne({ _id: categoryId }, {
    $push: { terms: { $each: newTerms } }
  })

  category.terms = category.terms.concat(newTerms)
  return res.send(category)
}
