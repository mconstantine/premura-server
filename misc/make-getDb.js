module.exports = ({ MongoClient, config }) => async () => {
  const { url, dbName } = config.db
  const client = await MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true })

  return Object.assign(client.db(dbName), { close: client.close })
}
