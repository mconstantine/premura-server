module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory,
  validateCreateCategory
}) =>
router
.use(loginGate)
.post('/categories', validateCreateCategory, sendValidation, catchExceptions(createCategory))
