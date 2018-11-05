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
.post('/login', validateLogin, sendValidation, catchExceptions(login))
.use(loginGate)
.post('/', validateCreateUser, sendValidation, catchExceptions(createUser))
.get('/', catchExceptions(getUsers))
.get('/find', catchExceptions(findUsers))
.get('/roles', catchExceptions(getJobRoles))
.get('/:id', catchExceptions(getUser))
.put('/:id', validateUpdateUser, sendValidation, catchExceptions(updateUser))
.delete('/:id', catchExceptions(deleteUser))
.post('/logout', logout)
