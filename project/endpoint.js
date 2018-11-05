module.exports = ({
  catchExceptions,
  router,
  loginGate,
  sendValidation,
  createProject,
  validateCreateProject
}) =>
router
.use(loginGate)
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
