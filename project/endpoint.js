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
  addPeople,
  validateCreateProject,
  validateUpdateProject,
  validateGetProjects,
  validateAddPeople
}) =>
router
.use(loginGate)
.get('/', validateGetProjects, sendValidation, catchExceptions(getProjects))
.get('/:id', catchExceptions(getProject))
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
.post('/:id/people', validateAddPeople, sendValidation, catchExceptions(addPeople))
.put('/:id', validateUpdateProject, sendValidation, catchExceptions(updateProject))
.delete('/:id', catchExceptions(deleteProject))
