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
      getActivities: 'getActivities',
      updateActivity: 'updateActivity',
      addPeople: 'addPeople',
      removePeople: 'removePeople',
      validateCreateActivity: 'validateCreateActivity',
      validateGetActivities: 'validateGetActivities',
      validateUpdateActivity: 'validateUpdateActivity',
      validateEditPeople: 'validateEditPeople',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(1)
    expect(router.use).toHaveBeenNthCalledWith(1, paths.loginGate)

    expect(router.get).toHaveBeenNthCalledWith(1,
      '/', paths.validateGetActivities, paths.sendValidation, paths.getActivities)

    expect(router.post).toHaveBeenCalledTimes(2)
    expect(router.post).toHaveBeenNthCalledWith(1,
      '/', paths.validateCreateActivity, paths.sendValidation, paths.createActivity)
    expect(router.post).toHaveBeenNthCalledWith(2,
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.addPeople)

    expect(router.put).toHaveBeenCalledTimes(1)
    expect(router.put).toHaveBeenNthCalledWith(1,
      '/:id', paths.validateUpdateActivity, paths.sendValidation, paths.updateActivity)

    expect(router.delete).toHaveBeenCalledTimes(1)
    expect(router.delete).toHaveBeenNthCalledWith(1,
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.removePeople)
  })
})
