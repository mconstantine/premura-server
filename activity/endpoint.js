module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createActivity,
  validateCreateActivity
}) =>
router
.use(loginGate)
.post('/', validateCreateActivity, sendValidation, catchExceptions(createActivity))
