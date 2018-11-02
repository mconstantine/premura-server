const getDb = require('../misc/getDb')
const { ObjectID } = require('mongodb')
const createError = require('../misc/createServerError')

module.exports = ({}) => async (req, res, next) => {
  const categoryId = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id: categoryId })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const terms = category.terms
  const termsToBeDeleted = req.body.terms.map(({ _id }) => ({ _id: new ObjectID(_id) }))

  for (let { _id } of termsToBeDeleted) {
    if (!terms.find(term => term._id.equals(_id))) {
      return next(createError(404, `term ${_id} not found`))
    }
  }

  // TODO: actually remove the terms
  console.log(termsToBeDeleted)
  return res.end('Endpoint not implemented.')
}
