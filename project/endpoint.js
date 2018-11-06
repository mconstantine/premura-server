module.exports = ({
  catchExceptions,
  router,
  loginGate,
  sendValidation,
  getProjects,
  createProject,
  updateProject,
  validateCreateProject,
  validateUpdateProject,
  validateGetProjects
}) =>
router
.use(loginGate)
.get('/', validateGetProjects, sendValidation, catchExceptions(getProjects))
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
.put('/:id', validateUpdateProject, sendValidation, catchExceptions(updateProject))
