module.exports = ({
  router,
  loginGate,
  createUser,
  getUsers,
  getUser,
  findUsers,
  updateUser,
  deleteUser,
  login,
  logout,
  sendValidation,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  getJobRoles,
  catchExceptions
}) =>
router
.post('/users/login', validateLogin, sendValidation, catchExceptions(login))
.use(loginGate)
.post('/users', validateCreateUser, sendValidation, catchExceptions(createUser))
.get('/users', catchExceptions(getUsers))
.get('/users/find', catchExceptions(findUsers))
.get('/users/roles', catchExceptions(getJobRoles))
.get('/users/:id', catchExceptions(getUser))
.put('/users/:id', validateUpdateUser, sendValidation, catchExceptions(updateUser))
.delete('/users/:id', catchExceptions(deleteUser))
.post('/users/logout', logout)
