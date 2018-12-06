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
  const category = await (await getDb()).collection('categories').findOne({ _id })

  if (!category) {
    return next(createError(404, gt.gettext('Category not found')))
  }

  return res.send(category)
}
