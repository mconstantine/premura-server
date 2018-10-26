module.exports = (req, res) => {
  delete req.session.user
  res.end()
}
