module.exports = (httpCode, message, ...messages) => {
  const errors = [message].concat(messages).map(msg => ({ msg }))
  return Object.assign(new Error(JSON.stringify({ errors })), { httpCode })
}
