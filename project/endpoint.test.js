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
      createProject: 'createProject',
      updateProject: 'updateProject',
      validateCreateProject: 'validateCreateProject',
      validateUpdateProject: 'validateUpdateProject',
      validateGetProjects: 'validateGetProjects',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])
    expect(router.get.mock.calls[0]).toEqual([
      '/', paths.validateGetProjects, paths.sendValidation, paths.getProjects
    ])
    expect(router.post.mock.calls[0]).toEqual([
      '/', paths.validateCreateProject, paths.sendValidation, paths.createProject
    ])
    expect(router.put.mock.calls[0]).toEqual([
      '/:id', paths.validateUpdateProject, paths.sendValidation, paths.updateProject
    ])
  })
})
