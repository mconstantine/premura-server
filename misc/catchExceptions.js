module.exports = handler => async (req, res, next) => {
  try {
    return await handler(req, res, next)
  } catch(ex) {
    return next(ex)
  }
}
