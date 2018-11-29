module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createActivity,
  updateActivity,
  validateCreateActivity,
  validateUpdateActivity
}) =>
router
.use(loginGate)
.post('/', validateCreateActivity, sendValidation, catchExceptions(createActivity))
.put('/:id', validateUpdateActivity, sendValidation, catchExceptions(updateActivity))
