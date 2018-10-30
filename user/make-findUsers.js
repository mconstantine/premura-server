module.exports = ({ createError, getDb, find }) => async (req, res, next) => {
  if (!req.query.q) {
    return next(createError(400, 'missing required parameter q (query)'))
  }

  const collection = (await getDb()).collection('users')
  const result = await (await find(collection, ['name'], req.query.q, {
    projection: {
      email: 0,
      password: 0,
      registrationDate: 0,
      lastLoginDate: 0
    }
  })).toArray()

  res.send(result)
}
