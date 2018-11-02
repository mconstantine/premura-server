module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory,
  getCategories,
  updateCategory,
  addTerms,
  validateCreateCategory,
  validateUpdateCategory,
  validateAddTerms
}) =>
router
.use(loginGate)
.get('/categories', catchExceptions(getCategories))
.post('/categories', validateCreateCategory, sendValidation, catchExceptions(createCategory))
.put('/categories/:id', validateUpdateCategory, sendValidation, catchExceptions(updateCategory))
.post('/categories/:id/terms', validateAddTerms, sendValidation, catchExceptions(addTerms))
