const endpoint = require('./endpoint')

describe('activity endpoint', () => {
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
      createActivity: 'createActivity',
      updateActivity: 'updateActivity',
      validateCreateActivity: 'validateCreateActivity',
      validateUpdateActivity: 'validateUpdateActivity',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(1)
    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])

    expect(router.post).toHaveBeenCalledTimes(1)
    expect(router.post.mock.calls[0]).toEqual([
      '/', paths.validateCreateActivity, paths.sendValidation, paths.createActivity
    ])

    expect(router.put).toHaveBeenCalledTimes(1)
    expect(router.put.mock.calls[0]).toEqual([
      '/:id', paths.validateUpdateActivity, paths.sendValidation, paths.updateActivity
    ])
  })
})
