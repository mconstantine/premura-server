module.exports = query => {
  const dbQuery = {}

  for (let i in query) {
    dbQuery[i] = {
      $regex: new RegExp(
        query[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),
        'gi'
      )
    }
  }

  return dbQuery
}
