module.exports = (httpCode, message) => Object.assign(new Error(message), { httpCode })
