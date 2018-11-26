const bcrypt = require('bcryptjs')
const { MongoClient } = require('mongodb')

const config = require('./config')
const app = require('../make-app')
const client = require('./getClient')()
const getDb = require('../misc/make-getDb')({ MongoClient, config })

module.exports = async () => {
  const db = await getDb()

  await app.open({ config, port: 3000 })
  await db.collection('users').insertOne({
    name: 'root',
    email: 'root@premura.com',
    password: await bcrypt.hash('root', 10),
    role: 'master',
    jobRole: 'Master',
    registrationDate: new Date(),
    lastUpdateDate: new Date(),
    isActive: true
  })

  await client.login()
}
