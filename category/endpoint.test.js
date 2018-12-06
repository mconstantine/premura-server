const endpoint = require('./endpoint')

describe('category endpoint', () => {
  const catchExceptions = x => x

  it('Should create the right paths', () => {
    const router = {
      use: jest.fn(() => router),
      get: jest.fn(() => router),
      post: jest.fn(() => router),
      put: jest.fn(() => router),
      delete: jest.fn(() => router)
    }

    const paths = {
      loginGate: 'loginGate',
      handleLanguages: 'handleLanguages',
      createCategory: 'createCategory',
      getCategories: 'getCategories',
      getCategory: 'getCategory',
      updateCategory: 'updateCategory',
      deleteCategory: 'deleteCategory',
      addTerms: 'addTerms',
      updateTerms: 'updateTerms',
      removeTerms: 'removeTerms',
      validateCreateCategory: 'validateCreateCategory',
      validateUpdateCategory: 'validateUpdateCategory',
      validateAddTerms: 'validateAddTerms',
      validateUpdateTerms: 'validateUpdateTerms',
      validateRemoveTerms: 'validateRemoveTerms',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(2)
    expect(router.use).toHaveBeenNthCalledWith(1, paths.loginGate)
    expect(router.use).toHaveBeenNthCalledWith(2, paths.handleLanguages)

    expect(router.get).toHaveBeenCalledTimes(2)
    expect(router.get).toHaveBeenNthCalledWith(1,'/', paths.getCategories)
    expect(router.get).toHaveBeenNthCalledWith(2,'/:id', paths.getCategory)

    expect(router.post).toHaveBeenCalledTimes(2)
    expect(router.post).toHaveBeenNthCalledWith(1,
      '/', paths.validateCreateCategory, paths.sendValidation, paths.createCategory)
    expect(router.post).toHaveBeenNthCalledWith(2,
      '/:id/terms', paths.validateAddTerms, paths.sendValidation, paths.addTerms)

    expect(router.put).toHaveBeenCalledTimes(2)
    expect(router.put).toHaveBeenNthCalledWith(1,
      '/:id', paths.validateUpdateCategory, paths.sendValidation, paths.updateCategory)
    expect(router.put).toHaveBeenNthCalledWith(2,
      '/:id/terms', paths.validateUpdateTerms, paths.sendValidation, paths.updateTerms)

    expect(router.delete).toHaveBeenCalledTimes(2)
    expect(router.delete).toHaveBeenNthCalledWith(1,'/:id', paths.deleteCategory)
    expect(router.delete).toHaveBeenNthCalledWith(2,
      '/:id/terms', paths.validateRemoveTerms, paths.sendValidation, paths.removeTerms)
  })
})
