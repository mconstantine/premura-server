module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  addPeople,
  removePeople,
  validateCreateActivity,
  validateGetActivities,
  validateUpdateActivity,
  validateEditPeople
}) =>
router
.use(loginGate)
.get('/', validateGetActivities, sendValidation, catchExceptions(getActivities))
.get('/:id', catchExceptions(getActivity))
.post('/', validateCreateActivity, sendValidation, catchExceptions(createActivity))
.post('/:id/people', validateEditPeople, sendValidation, catchExceptions(addPeople))
.put('/:id', validateUpdateActivity, sendValidation, catchExceptions(updateActivity))
.delete('/:id', catchExceptions(deleteActivity))
.delete('/:id/people', validateEditPeople, sendValidation, catchExceptions(removePeople))
