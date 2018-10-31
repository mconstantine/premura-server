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
      addTerms: 'addTerms',
      validateCreateCategory: 'validateCreateCategory',
      validateAddTerms: 'validateAddTerms',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])
    expect(router.post.mock.calls[0]).toEqual([
      '/categories', paths.validateCreateCategory, paths.sendValidation, paths.createCategory
    ])
    expect(router.post.mock.calls[1]).toEqual([
      '/categories/:id/terms', paths.validateAddTerms, paths.sendValidation, paths.addTerms
    ])
  })
})
