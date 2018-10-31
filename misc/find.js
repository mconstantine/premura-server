module.exports = async (collection, query, options) => {
  const dbQuery = {}

  for (let i in query) {
    dbQuery[i] = {
      $regex: new RegExp(
        query[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),
        'gi'
      )
    }
  }

  return await collection.find(dbQuery, options)
}
