module.exports = ({ getDb, find }) => async (req, res, next) => {
  if (!req.query.q) {
    return res.status(422).send({
      errors: [{
        location: 'query',
        param: 'q',
        value: req.query.q,
        msg: 'query is empty'
      }]
    })
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
