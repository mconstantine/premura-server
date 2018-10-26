module.exports = (code, message) => Object.assign(new Error(message), { code })
