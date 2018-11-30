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
      addPeople: 'addPeople',
      removePeople: 'removePeople',
      validateCreateActivity: 'validateCreateActivity',
      validateUpdateActivity: 'validateUpdateActivity',
      validateEditPeople: 'validateEditPeople',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(1)
    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])

    expect(router.post).toHaveBeenCalledTimes(2)
    expect(router.post.mock.calls[0]).toEqual([
      '/', paths.validateCreateActivity, paths.sendValidation, paths.createActivity
    ])
    expect(router.post.mock.calls[1]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.addPeople
    ])

    expect(router.put).toHaveBeenCalledTimes(1)
    expect(router.put.mock.calls[0]).toEqual([
      '/:id', paths.validateUpdateActivity, paths.sendValidation, paths.updateActivity
    ])

    expect(router.delete).toHaveBeenCalledTimes(1)
    expect(router.delete.mock.calls[0]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.removePeople
    ])
  })
})
