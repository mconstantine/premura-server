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
      validateCreateProject: 'validateCreateProject',
      validateUpdateProject: 'validateUpdateProject',
      validateGetProjects: 'validateGetProjects',
      validateEditPeople: 'validateEditPeople',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])
    expect(router.get.mock.calls[0]).toEqual([
      '/', paths.validateGetProjects, paths.sendValidation, paths.getProjects
    ])
    expect(router.get.mock.calls[1]).toEqual(['/:id', paths.getProject])
    expect(router.post.mock.calls[0]).toEqual([
      '/', paths.validateCreateProject, paths.sendValidation, paths.createProject
    ])
    expect(router.post.mock.calls[1]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.addPeople
    ])
    expect(router.put.mock.calls[0]).toEqual([
      '/:id', paths.validateUpdateProject, paths.sendValidation, paths.updateProject
    ])
    expect(router.put.mock.calls[1]).toEqual([
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.updatePeople
    ])
    expect(router.delete.mock.calls[0]).toEqual(['/:id', paths.deleteProject])
  })
})
