module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory,
  updateCategory,
  addTerms,
  validateCreateCategory,
  validateUpdateCategory,
  validateAddTerms
}) =>
router
.use(loginGate)
.post('/categories', validateCreateCategory, sendValidation, catchExceptions(createCategory))
.put('/categories/:id', validateUpdateCategory, sendValidation, catchExceptions(updateCategory))
.post('/categories/:id/terms', validateAddTerms, sendValidation, catchExceptions(addTerms))
