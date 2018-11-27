const { MongoClient } = require('mongodb')

const config = require('./config')
const getDb = require('../misc/make-getDb')({ MongoClient, config })
const app = require('../make-app')

module.exports = async () => {
  const db = await getDb()
  await db.collection('users').deleteOne({
    email: 'root@premura.com'
  })
  await app.close()
  await db.close()
}
