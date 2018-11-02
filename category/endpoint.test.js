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
      updateCategory: 'updateCategory',
      addTerms: 'addTerms',
      validateCreateCategory: 'validateCreateCategory',
      validateUpdateCategory: 'validateUpdateCategory',
      validateAddTerms: 'validateAddTerms',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])
    expect(router.get.mock.calls[0]).toEqual(['/categories', paths.getCategories])
    expect(router.post.mock.calls[0]).toEqual([
      '/categories', paths.validateCreateCategory, paths.sendValidation, paths.createCategory
    ])
    expect(router.post.mock.calls[1]).toEqual([
      '/categories/:id/terms', paths.validateAddTerms, paths.sendValidation, paths.addTerms
    ])
    expect(router.put.mock.calls[0]).toEqual([
      '/categories/:id', paths.validateUpdateCategory, paths.sendValidation, paths.updateCategory
    ])
  })
})
