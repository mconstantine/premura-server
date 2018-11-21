const endpoint = require('./endpoint')

describe('project endpoint', () => {
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
      getProjects: 'getProjects',
      getProject: 'getProject',
      createProject: 'createProject',
      updateProject: 'updateProject',
      deleteProject: 'deleteProject',
      addPeople: 'addPeople',
      updatePeople: 'updatePeople',
      removePeople: 'removePeople',
      addDeadlines: 'addDeadlines',
      addTerms: 'addTerms',
      moveTerms: 'moveTerms',
      removeTerms: 'removeTerms',
      removeDeadlines: 'removeDeadlines',
      validateCreateProject: 'validateCreateProject',
      validateUpdateProject: 'validateUpdateProject',
      validateGetProjects: 'validateGetProjects',
      validateEditPeople: 'validateEditPeople',
      validateEditDeadlines: 'validateEditDeadlines',
      validateEditTerms: 'validateEditTerms',
      validateMoveTerms: 'validateMoveTerms',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(1)
    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])

    expect(router.get).toHaveBeenCalledTimes(2)
    expect(router.get.mock.calls[0]).toEqual([
      '/', paths.validateGetProjects, paths.sendValidation, paths.getProjects
    ])
    expect(router.get.mock.calls[1]).toEqual(['/:id', paths.getProject])

    expect(router.post).toHaveBeenCalledTimes(4)
    expect(router.post.mock.calls[0]).toEqual([
      '/', paths.validateCreateProject, paths.sendValidation, paths.createProject
    ])
    expect(router.post.mock.calls[1]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.addPeople
    ])
    expect(router.post.mock.calls[2]).toEqual([
      '/:id/deadlines', paths.validateEditDeadlines, paths.sendValidation, paths.addDeadlines
    ])
    expect(router.post.mock.calls[3]).toEqual([
      '/:id/terms', paths.validateEditTerms, paths.sendValidation, paths.addTerms
    ])

    expect(router.put).toHaveBeenCalledTimes(3)
    expect(router.put.mock.calls[0]).toEqual([
      '/:id', paths.validateUpdateProject, paths.sendValidation, paths.updateProject
    ])
    expect(router.put.mock.calls[1]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.updatePeople
    ])
    expect(router.put.mock.calls[2]).toEqual([
      '/:id/terms', paths.validateMoveTerms, paths.sendValidation, paths.moveTerms
    ])

    expect(router.delete).toHaveBeenCalledTimes(4)
    expect(router.delete.mock.calls[0]).toEqual(['/:id', paths.deleteProject])
    expect(router.delete.mock.calls[1]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.removePeople
    ])
    expect(router.delete.mock.calls[2]).toEqual([
      '/:id/deadlines', paths.validateEditDeadlines, paths.sendValidation, paths.removeDeadlines
    ])
    expect(router.delete.mock.calls[3]).toEqual([
      '/:id/terms', paths.validateEditTerms, paths.sendValidation, paths.removeTerms
    ])
  })
})
