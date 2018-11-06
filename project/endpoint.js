module.exports = ({
  catchExceptions,
  router,
  loginGate,
  sendValidation,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  validateCreateProject,
  validateUpdateProject,
  validateGetProjects
}) =>
router
.use(loginGate)
.get('/', validateGetProjects, sendValidation, catchExceptions(getProjects))
.get('/:id', catchExceptions(getProject))
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
.put('/:id', validateUpdateProject, sendValidation, catchExceptions(updateProject))
.delete('/:id', catchExceptions(deleteProject))
