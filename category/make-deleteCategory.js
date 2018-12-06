module.exports = ({ getDb, ObjectID, createError, gt }) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: gt.gettext('Invalid category ID')
      }]
    })
  }

  const _id = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id })

  if (!category) {
    return next(createError(404, gt.gettext('Category not found')))
  }

  await collection.deleteOne({ _id })
  return res.end()
}
