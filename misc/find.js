module.exports = async (collection, fields, query, options) => {
  const indexOptions = fields.reduce((res, field) => {
    res[field] = 'text'
    return res
  }, {})

  await collection.createIndex(indexOptions)

  return await collection.find({
    $text: {
      $search: query
    }
  }, options)
}
