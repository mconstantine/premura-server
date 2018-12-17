module.exports = ({ gt }) => (req, res, next) => {
  if (req.session.user && req.session.user.lang) {
    gt.setLocale(req.session.user.lang)
  }

  return next()
}
