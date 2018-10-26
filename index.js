const express = require('express')
const cors = require('cors')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const bodyParser = require('body-parser')

const config = require('./config')

const app = express()
const sessionOptions = config.session

sessionOptions.store = new MongoDBStore(config.db)

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

app.get('/', (req, res) => res.send('Hello ' + JSON.stringify(req.session)))

// Catch any error from previous handlers
.use((error, req, res, next) => {
  if (error instanceof Error) {
    res.setHeader('Content-Type', 'text/plain')

    if (error.code || error.message) {
      const code = !isNaN(parseInt(error.code)) ? error.code : 500

      if (code !== 500 || error.send) {
        // Code and message
        return res
          .status(error.code)
          .send(error.message + (error.body ? `\n${JSON.stringify(error.body)}` : ''))
      } else {
        // Message only, probably a Node error
        console.log(error.message)
        return res.status(code).end()
      }
    }

    // No code, no message
    console.log(error)
    return res.status(500).end()
  }

  next()
})
// Default to 404
.use((req, res) => res.status(404).end())
.listen(5000)
