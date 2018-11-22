const config = require('./config')
const app = require('./make-app')({ config })

app.listen(5000)
