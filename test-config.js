module.exports = {
  session: {
    key: 'premura_session',
    secret: '^#4k7C$YRJN2myJpe%Ygx4GkLd%SQGuR',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 24 * 14 * 1000 }
  },
  env: 'development',
  db: {
    url: 'mongodb://localhost:27017',
    dbName: 'premura-test',
    sessionsCollection: 'sessions'
  }
}
