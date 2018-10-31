module.exports = ({
  bcrypt, getDb, roles, createError, sensitiveInformationProjection
}) => async (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const role = req.body.role
  const jobRole = req.body.jobRole
  const currentUser = req.session.user

  if (roles.indexOf(role) >= roles.indexOf(currentUser.role)) {
    return next(createError(401, 'you cannot register a user with a role higher than yours'))
  }

  const collection = (await getDb()).collection('users')
  const alreadyExistingUser = await collection.findOne({ email }, {
    projection: sensitiveInformationProjection
  })

  if (alreadyExistingUser) {
    return next(createError(409, JSON.stringify(alreadyExistingUser)))
  }

  const result = await collection.insertOne({
    name, email, role, jobRole,
    password: await bcrypt.hash(password, 10),
    registrationDate: new Date()
  })

  res.status(201).send({ _id: result.insertedId })
}
