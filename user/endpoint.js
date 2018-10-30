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
  validateUpdateUser
}) => {
  router
  .post('/users/login', validateLogin, sendValidation, login)
  .use(loginGate)
  .post('/users', validateCreateUser, sendValidation, createUser)
  .get('/users', getUsers)
  .get('/users/find', findUsers)
  .get('/users/:id', getUser)
  .put('/users/:id', validateUpdateUser, sendValidation, updateUser)
  .delete('/users/:id', deleteUser)
  .post('/users/logout', logout)

  return router
}
