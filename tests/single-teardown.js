const { MongoClient } = require('mongodb')
const config = require('./config')

module.exports = async () => {
  const { url, dbName } = config.db
  const connection = await MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true })

  await connection.db().collection('projects').deleteMany({})
  await connection.db().collection('activities').deleteMany({})
  await connection.db().collection('categories').deleteMany({})
  await connection.db().collection('users').deleteMany({ email: { $ne: 'root@premura.com' } })

  connection.close()
}
