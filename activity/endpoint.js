module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createActivity,
  updateActivity,
  addPeople,
  validateCreateActivity,
  validateUpdateActivity,
  validateEditPeople
}) =>
router
.use(loginGate)
.post('/', validateCreateActivity, sendValidation, catchExceptions(createActivity))
.post('/:id/people', validateEditPeople, sendValidation, catchExceptions(addPeople))
.put('/:id', validateUpdateActivity, sendValidation, catchExceptions(updateActivity))
