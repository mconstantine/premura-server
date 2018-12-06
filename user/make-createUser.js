module.exports = ({
  bcrypt, getDb, roles, createError, sensitiveInformationProjection, gt
}) => async (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const role = req.body.role
  const lang = req.body.lang
  const jobRole = req.body.jobRole
  const currentUser = req.session.user

  if (roles.indexOf(role) >= roles.indexOf(currentUser.role)) {
    return next(createError(401, gt.gettext("You can't register a user with a role higher than yours")))
  }

  const collection = (await getDb()).collection('users')
  const alreadyExistingUser = await collection.findOne({ email }, {
    projection: sensitiveInformationProjection
  })

  if (alreadyExistingUser) {
    return next(
      createError(409, {
        msg: gt.gettext('A user is registered with the same e-mail address'),
        conflict: alreadyExistingUser
      })
    )
  }

  const result = await collection.insertOne({
    name, email, role, lang, jobRole,
    password: await bcrypt.hash(password, 10),
    registrationDate: new Date(),
    lastUpdateDate: new Date(),
    isActive: true
  })

  res.status(201).send({ _id: result.insertedId })
}
