const endpoint = require('./endpoint')

describe('user endpoint', () => {
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
      createUser: 'createUser',
      getUsers: 'getUsers',
      getUser: 'getUser',
      getJobRoles: 'getJobRoles',
      updateUser: 'updateUser',
      deleteUser: 'deleteUser',
      login: 'login',
      logout: 'logout',
      validateCreateUser: 'validateCreateUser',
      validateLogin: 'validateLogin',
      validateUpdateUser: 'validateUpdateUser',
      sendValidation: 'sendValidation'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))

    expect(router.use).toHaveBeenCalledTimes(1)
    expect(router.use).toHaveBeenNthCalledWith(1, paths.loginGate)

    expect(router.get).toHaveBeenCalledTimes(3)
    expect(router.get).toHaveBeenNthCalledWith(1, '/', paths.getUsers)
    expect(router.get).toHaveBeenNthCalledWith(2, '/roles', paths.getJobRoles)
    expect(router.get).toHaveBeenNthCalledWith(3, '/:id', paths.getUser)

    expect(router.post).toHaveBeenCalledTimes(3)
    expect(router.post).toHaveBeenNthCalledWith(1,
      '/login', paths.validateLogin, paths.sendValidation, paths.login)
    expect(router.post).toHaveBeenNthCalledWith(2,
      '/', paths.validateCreateUser, paths.sendValidation, paths.createUser)
    expect(router.post).toHaveBeenNthCalledWith(3,'/logout', paths.logout)

    expect(router.put).toHaveBeenCalledTimes(1)
    expect(router.put).toHaveBeenNthCalledWith(1,
      '/:id', paths.validateUpdateUser, paths.sendValidation, paths.updateUser)

    expect(router.delete).toHaveBeenCalledTimes(1)
    expect(router.delete).toHaveBeenNthCalledWith(1, '/:id', paths.deleteUser)
  })

  it('Should allow login before using loginGate', () => {
    let didCreateLoginPath = false

    const router = {
      use: function() {
        if (arguments[0] === paths.loginGate && !didCreateLoginPath) {
          throw new Error('It does not allow login before using loginGate')
        }

        return router
      },
      post: function() {
        if (arguments[3] === paths.login) {
          didCreateLoginPath = true
        }

        return router
      },
      get: () => router,
      put: () => router,
      delete: () => router
    }

    const paths = {
      loginGate: 'loginGate',
      createUser: 'createUser',
      getUsers: 'getUsers',
      getUser: 'getUser',
      updateUser: 'updateUser',
      deleteUser: 'deleteUser',
      login: 'login',
      logout: 'logout'
    }

    endpoint(Object.assign(paths, { router, catchExceptions }))
  })
})
