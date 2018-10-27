const { MongoClient } = require('mongodb')
const { url, dbName } = require('../config').db

module.exports = async () => {
  const client = await MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true })
  return Object.assign(client.db(dbName), { close: client.close })
}
