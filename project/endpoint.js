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
  updatePeople,
  removePeople,
  addDeadlines,
  removeDeadlines,
  validateCreateProject,
  validateUpdateProject,
  validateGetProjects,
  validateEditPeople,
  validateEditDeadlines
}) =>
router
.use(loginGate)
.get('/', validateGetProjects, sendValidation, catchExceptions(getProjects))
.get('/:id', catchExceptions(getProject))
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
.post('/:id/people', validateEditPeople, sendValidation, catchExceptions(addPeople))
.post('/:id/deadlines', validateEditDeadlines, sendValidation, catchExceptions(addDeadlines))
.put('/:id', validateUpdateProject, sendValidation, catchExceptions(updateProject))
.put('/:id/people', validateEditPeople, sendValidation, catchExceptions(updatePeople))
.delete('/:id', catchExceptions(deleteProject))
.delete('/:id/people', validateEditPeople, sendValidation, catchExceptions(removePeople))
.delete('/:id/deadlines', validateEditDeadlines, sendValidation, catchExceptions(removeDeadlines))
