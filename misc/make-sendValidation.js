module.exports = ({ validationResult }) => (req, res, next) => {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    return res.status(422).send({ errors: result.array() })
  }

  return next()
}
