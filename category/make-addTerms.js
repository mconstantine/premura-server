const getDb = require('../misc/getDb')
const { ObjectID } = require('mongodb')
const createError = require('../misc/createServerError')

module.exports = ({}) => async (req, res, next) => {
  const _id = new ObjectID(req.params.id)
  const collection = (await getDb()).collection('categories')
  const category = await collection.findOne({ _id })

  if (!category) {
    return next(createError(404, 'category not found'))
  }

  const terms = category.terms || []
  const termsNames = terms.map(term => term.name)

  return res.end('Endpoint not implemented.')
}
