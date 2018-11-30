module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createActivity,
  updateActivity,
  addPeople,
  removePeople,
  validateCreateActivity,
  validateUpdateActivity,
  validateEditPeople
}) =>
router
.use(loginGate)
.post('/', validateCreateActivity, sendValidation, catchExceptions(createActivity))
.post('/:id/people', validateEditPeople, sendValidation, catchExceptions(addPeople))
.put('/:id', validateUpdateActivity, sendValidation, catchExceptions(updateActivity))
.delete('/:id/people', validateEditPeople, sendValidation, catchExceptions(removePeople))
