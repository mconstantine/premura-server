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
      handleLanguages: 'handleLanguages',
      getProjects: 'getProjects',
      getProject: 'getProject',
      createProject: 'createProject',
      updateProject: 'updateProject',
      deleteProject: 'deleteProject',
      addPeople: 'addPeople',
      updatePeople: 'updatePeople',
      removePeople: 'removePeople',
      addDeadlines: 'addDeadlines',
      addMessage: 'addMessage',
      getMessages: 'getMessages',
      updateMessage: 'updateMessage',
      addTerms: 'addTerms',
      moveTerms: 'moveTerms',
      removeTerms: 'removeTerms',
      removeDeadlines: 'removeDeadlines',
      validateCreateProject: 'validateCreateProject',
      validateUpdateProject: 'validateUpdateProject',
      validateGetProjects: 'validateGetProjects',
      validateEditPeople: 'validateEditPeople',
      validateEditDeadlines: 'validateEditDeadlines',
      validateAddMessage: 'validateAddMessage',
      validateUpdateMessage: 'validateUpdateMessage',
      validateEditTerms: 'validateEditTerms',
      validateMoveTerms: 'validateMoveTerms',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(2)
    expect(router.use).toHaveBeenNthCalledWith(1, paths.loginGate)
    expect(router.use).toHaveBeenNthCalledWith(2, paths.handleLanguages)

    expect(router.get).toHaveBeenCalledTimes(3)
    expect(router.get).toHaveBeenNthCalledWith(1,
      '/', paths.validateGetProjects, paths.sendValidation, paths.getProjects)
    expect(router.get).toHaveBeenNthCalledWith(2,'/:id', paths.getProject)
    expect(router.get).toHaveBeenNthCalledWith(3,'/:id/messages', paths.getMessages)

    expect(router.post).toHaveBeenCalledTimes(5)
    expect(router.post).toHaveBeenNthCalledWith(1,
      '/', paths.validateCreateProject, paths.sendValidation, paths.createProject)
    expect(router.post).toHaveBeenNthCalledWith(2,
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.addPeople)
    expect(router.post).toHaveBeenNthCalledWith(3,
      '/:id/deadlines', paths.validateEditDeadlines, paths.sendValidation, paths.addDeadlines)
    expect(router.post).toHaveBeenNthCalledWith(4,
      '/:id/messages', paths.validateAddMessage, paths.sendValidation, paths.addMessage)
    expect(router.post).toHaveBeenNthCalledWith(5,
      '/:id/terms', paths.validateEditTerms, paths.sendValidation, paths.addTerms)

    expect(router.put).toHaveBeenCalledTimes(4)
    expect(router.put).toHaveBeenNthCalledWith(1,
      '/:id', paths.validateUpdateProject, paths.sendValidation, paths.updateProject)
    expect(router.put).toHaveBeenNthCalledWith(2,
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.updatePeople)
    expect(router.put).toHaveBeenNthCalledWith(3,
      '/:id/terms', paths.validateMoveTerms, paths.sendValidation, paths.moveTerms)
    expect(router.put).toHaveBeenNthCalledWith(4,
      '/:id/messages/:messageId', paths.validateUpdateMessage, paths.sendValidation, paths.updateMessage)

    expect(router.delete).toHaveBeenCalledTimes(4)
    expect(router.delete).toHaveBeenNthCalledWith(1,'/:id', paths.deleteProject)
    expect(router.delete).toHaveBeenNthCalledWith(2,
      '/:id/people', paths.validateEditPeople, paths.sendValidation, paths.removePeople)
    expect(router.delete).toHaveBeenNthCalledWith(3,
      '/:id/deadlines', paths.validateEditDeadlines, paths.sendValidation, paths.removeDeadlines)
    expect(router.delete).toHaveBeenNthCalledWith(4,
      '/:id/terms', paths.validateEditTerms, paths.sendValidation, paths.removeTerms)
  })
})
