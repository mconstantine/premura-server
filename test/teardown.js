const { MongoClient } = require('mongodb')

const config = require('./config')
const getDb = require('../misc/make-getDb')({ MongoClient, config })
const app = require('../make-app')

module.exports = async () => {
  const db = await getDb()

  await db.collection('users').deleteMany({})
  await db.collection('projects').deleteMany({})
  await db.collection('categories').deleteMany({})
  await db.collection('activities').deleteMany({})

  await app.close()
  await db.close()
}
