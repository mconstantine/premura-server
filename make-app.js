const express = require('express')
const cors = require('cors')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const bodyParser = require('body-parser')

const app = express()

const user = require('./user/index')
const category = require('./category/index')
const project = require('./project/index')
const activity = require('./activity/index')

module.exports = ({ config }) => {
  const sessionOptions = config.session

  sessionOptions.store = new MongoDBStore({
    uri: `${config.db.url}/${config.db.dbName}`,
    collection: config.db.sessionsCollection
  })

  if (config.env === 'production') {
    app.set('trust proxy', 1)
    session.cookie.secure = true
  } else if (config.env === 'development') {
    app.use(cors({
      origin: true,
      credentials: true,
      exposedHeaders: [],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    }))
  }

  app
  .use(session(sessionOptions))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use('/users', user)
  .use('/categories', category)
  .use('/projects', project)
  .use('/activities', activity)

  app.get('/', (req, res) => res.send('Hello ' + JSON.stringify(req.session)))

  // Catch any error from previous handlers
  .use((error, req, res, next) => {
    if (error instanceof Error) {
      res.setHeader('Content-Type', 'text/plain')

      if (error.httpCode || error.message) {
        const httpCode = !isNaN(parseInt(error.httpCode)) ? error.httpCode : 500

        if (httpCode !== 500 || error.send) {
          // Code and message
          return res
            .status(error.httpCode)
            .send(error.message + (error.body ? `\n${JSON.stringify(error.body)}` : ''))
        } else {
          // Message only, probably a Node error
          console.log(error.message)
          return res.status(httpCode).end()
        }
      }

      // No httpCode, no message
      console.log(error)
      return res.status(500).end()
    }

    next()
  })
  // Default to 404
  .use((req, res) => res.status(404).end())

  return app
}
