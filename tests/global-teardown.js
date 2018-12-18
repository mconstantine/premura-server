const makeApp = require('../make-app')
const { MongoClient } = require('mongodb')
const config = require('./config')

module.exports = async () => {
  const { url, dbName } = config.db
  const connection = await MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true })

  await connection.db().collection('users').deleteMany({})
  await makeApp.close()

  connection.close()
}
