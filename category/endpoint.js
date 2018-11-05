module.exports = ({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory,
  getCategories,
  findCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  addTerms,
  updateTerms,
  removeTerms,
  validateCreateCategory,
  validateUpdateCategory,
  validateAddTerms,
  validateUpdateTerms,
  validateRemoveTerms
}) =>
router
.use(loginGate)
.get('/', catchExceptions(getCategories))
.get('/find', catchExceptions(findCategories))
.get('/:id', catchExceptions(getCategory))
.post('/', validateCreateCategory, sendValidation, catchExceptions(createCategory))
.put('/:id', validateUpdateCategory, sendValidation, catchExceptions(updateCategory))
.put('/:id/terms', validateUpdateTerms, sendValidation, catchExceptions(updateTerms))
.delete('/:id', catchExceptions(deleteCategory))
.delete('/:id/terms', validateRemoveTerms, sendValidation, catchExceptions(removeTerms))
.post('/:id/terms', validateAddTerms, sendValidation, catchExceptions(addTerms))
