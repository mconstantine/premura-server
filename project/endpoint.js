module.exports = ({
  catchExceptions,
  router,
  loginGate,
  sendValidation,
  createProject,
  updateProject,
  validateCreateProject,
  validateUpdateProject
}) =>
router
.use(loginGate)
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
.put('/:id', validateUpdateProject, sendValidation, catchExceptions(updateProject))
