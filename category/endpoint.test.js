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
      createCategory: 'createCategory',
      getCategories: 'getCategories',
      findCategories: 'findCategories',
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

    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])
    expect(router.get.mock.calls[0]).toEqual(['/', paths.getCategories])
    expect(router.get.mock.calls[1]).toEqual(['/find', paths.findCategories])
    expect(router.get.mock.calls[2]).toEqual(['/:id', paths.getCategory])
    expect(router.post.mock.calls[0]).toEqual([
      '/', paths.validateCreateCategory, paths.sendValidation, paths.createCategory
    ])
    expect(router.post.mock.calls[1]).toEqual([
      '/:id/terms', paths.validateAddTerms, paths.sendValidation, paths.addTerms
    ])
    expect(router.put.mock.calls[0]).toEqual([
      '/:id', paths.validateUpdateCategory, paths.sendValidation, paths.updateCategory
    ])
    expect(router.put.mock.calls[1]).toEqual([
      '/:id/terms', paths.validateUpdateTerms, paths.sendValidation, paths.updateTerms
    ])
    expect(router.delete.mock.calls[0]).toEqual(['/:id', paths.deleteCategory])
    expect(router.delete.mock.calls[1]).toEqual([
      '/:id/terms', paths.validateRemoveTerms, paths.sendValidation, paths.removeTerms
    ])
  })
})
