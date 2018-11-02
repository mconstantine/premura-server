module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  addTerms,
  updateTerms,
  validateCreateCategory,
  validateUpdateCategory,
  validateAddTerms,
  validateUpdateTerms
}) =>
router
.use(loginGate)
.get('/categories', catchExceptions(getCategories))
.get('/categories/:id', catchExceptions(getCategory))
.post('/categories', validateCreateCategory, sendValidation, catchExceptions(createCategory))
.put('/categories/:id', validateUpdateCategory, sendValidation, catchExceptions(updateCategory))
.put('/categories/:id/terms', validateUpdateTerms, sendValidation, catchExceptions(updateTerms))
.delete('/categories/:id', catchExceptions(deleteCategory))
.post('/categories/:id/terms', validateAddTerms, sendValidation, catchExceptions(addTerms))
