module.exports = ({
  router,
  loginGate,
  handleLanguages,
  createUser,
  getUsers,
  getUser,
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
.use(handleLanguages)
.post('/', validateCreateUser, sendValidation, catchExceptions(createUser))
.get('/', catchExceptions(getUsers))
.get('/roles', catchExceptions(getJobRoles))
.get('/:id', catchExceptions(getUser))
.put('/:id', validateUpdateUser, sendValidation, catchExceptions(updateUser))
.delete('/:id', catchExceptions(deleteUser))
.post('/logout', logout)
