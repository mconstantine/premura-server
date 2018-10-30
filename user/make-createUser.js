module.exports = ({ bcrypt, getDb, roles, createError }) => async (req, res, next) => {
  if (roles.indexOf(req.session.user.role) < roles.indexOf(req.body.role)) {
    return next(createError(401, 'you cannot register a user with a role higher than yours'))
  }

  const collection = (await getDb()).collection('users')
  const alreadyExistingUser = await collection.findOne({ email: req.body.email })

  if (alreadyExistingUser) {
    delete alreadyExistingUser.email
    delete alreadyExistingUser.password
    delete alreadyExistingUser.registrationDate
    delete alreadyExistingUser.lastLoginDate
    return next(createError(409, JSON.stringify(alreadyExistingUser)))
  }

  const result = await collection.insertOne({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    role: req.body.role,
    jobRole: req.body.jobRole,
    registrationDate: new Date()
  })

  res.status(201).send({ _id: result.insertedId })
}
