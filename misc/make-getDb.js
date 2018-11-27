let db

module.exports = ({ MongoClient, config }) => async () => {
  return db || (async () => {
    const { url, dbName } = config.db
    const client = await MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true })

    db = Object.assign(client.db(dbName), { close: client.close })
    return db
  })()
}
