module.exports = ({
  catchExceptions,
  router,
  loginGate,
  handleLanguages,
  sendValidation,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addPeople,
  updatePeople,
  removePeople,
  addTerms,
  moveTerms,
  removeTerms,
  addDeadlines,
  removeDeadlines,
  addMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  validateCreateProject,
  validateUpdateProject,
  validateGetProjects,
  validateEditPeople,
  validateEditDeadlines,
  validateAddMessage,
  validateUpdateMessage,
  validateEditTerms,
  validateMoveTerms
}) =>
router
.use(loginGate)
.use(handleLanguages)
.get('/', validateGetProjects, sendValidation, catchExceptions(getProjects))
.get('/:id', catchExceptions(getProject))
.get('/:id/messages', catchExceptions(getMessages))
.post('/', validateCreateProject, sendValidation, catchExceptions(createProject))
.post('/:id/people', validateEditPeople, sendValidation, catchExceptions(addPeople))
.post('/:id/deadlines', validateEditDeadlines, sendValidation, catchExceptions(addDeadlines))
.post('/:id/messages', validateAddMessage, sendValidation, catchExceptions(addMessage))
.post('/:id/terms', validateEditTerms, sendValidation, catchExceptions(addTerms))
.put('/:id', validateUpdateProject, sendValidation, catchExceptions(updateProject))
.put('/:id/people', validateEditPeople, sendValidation, catchExceptions(updatePeople))
.put('/:id/terms', validateMoveTerms, sendValidation, catchExceptions(moveTerms))
.put('/:id/messages/:messageId', validateUpdateMessage, sendValidation, catchExceptions(updateMessage))
.delete('/:id', catchExceptions(deleteProject))
.delete('/:id/people', validateEditPeople, sendValidation, catchExceptions(removePeople))
.delete('/:id/deadlines', validateEditDeadlines, sendValidation, catchExceptions(removeDeadlines))
.delete('/:id/terms', validateEditTerms, sendValidation, catchExceptions(removeTerms))
.delete('/:id/messages/:messageId', catchExceptions(deleteMessage))
