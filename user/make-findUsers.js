module.exports = ({ getDb, find, sensitiveInformationProjection }) => async (req, res) => {
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
    projection: sensitiveInformationProjection
  })).toArray()

  res.send(result)
}
