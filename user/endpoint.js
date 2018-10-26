module.exports = ({
  router,
  loginGate,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  login,
  logout
}) => {
  router
  .post('/users/login', login)
  .use(loginGate)
  .post('/users', createUser)
  .get('/users', getUsers)
  .get('/users/:id', getUser)
  .put('/users/:id', updateUser)
  .delete('/users/:id', deleteUser)
  .post('/users/logout', logout)

  return router
}
