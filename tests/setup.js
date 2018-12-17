const { MongoClient } = require('mongodb')
const makeApp = require('../make-app')
const config = require('./config')
const Client = require('./client')
const bcrypt = require('bcryptjs')

module.exports = async () => {
  const { url, dbName } = config.db
  const connection = await MongoClient.connect(`${url}/${dbName}`, { useNewUrlParser: true })
  const client = new Client('http://localhost:3000')
  const user = Object.assign({}, client.getUser())

  user.password = await bcrypt.hash(user.password, 10)
  await connection.db().collection('users').insertOne(user)

  connection.close()
  makeApp.open({ config, port: 3000 })
}
