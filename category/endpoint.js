module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory,
  addTerms,
  validateCreateCategory,
  validateAddTerms
}) =>
router
.use(loginGate)
.post('/categories', validateCreateCategory, sendValidation, catchExceptions(createCategory))
.post('/categories/:id/terms', validateAddTerms, sendValidation, catchExceptions(addTerms))
