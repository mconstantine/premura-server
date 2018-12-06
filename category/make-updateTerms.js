module.exports = ({ getDb, ObjectID, createError, gt }) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, gt.gettext('Category not found')))
  }

  const terms = category.terms
  const updatedTerms = req.body.terms
  const errors = []

  updatedTerms.forEach(({ _id, name }, index) => {
    const term = terms.find(term => term._id.toString() === _id)

    if (!term) {
      errors.push({
        location: 'body',
        param: `terms[${index}]`,
        value: _id,
        msg: gt.gettext('Term not found')
      })

      return
    }

    term.name = name
  })

  if (errors.length) {
    return res.status(422).send({ errors })
  }

  await collection.updateOne({ _id: categoryId }, {
    $set: {
      terms,
      lastUpdateDate: new Date()
    }
  })

  return res.send(category)
}
