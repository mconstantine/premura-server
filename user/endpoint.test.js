const endpoint = require('./endpoint')

describe('endpoint', () => {
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
      findUsers: 'findUsers',
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

    expect(router.use.mock.calls[0]).toEqual([paths.loginGate])
    expect(router.get.mock.calls[0]).toEqual(['/users', paths.getUsers])
    expect(router.get.mock.calls[1]).toEqual(['/users/find', paths.findUsers])
    expect(router.get.mock.calls[2]).toEqual(['/users/:id', paths.getUser])
    expect(router.post.mock.calls[0]).toEqual([
      '/users/login', 'validateLogin', 'sendValidation', paths.login])
    expect(router.post.mock.calls[1]).toEqual([
      '/users', 'validateCreateUser', 'sendValidation', paths.createUser
    ])
    expect(router.post.mock.calls[2]).toEqual(['/users/logout', paths.logout])
    expect(router.put.mock.calls[0]).toEqual([
      '/users/:id', 'validateUpdateUser', 'sendValidation', paths.updateUser
    ])
    expect(router.delete.mock.calls[0]).toEqual(['/users/:id', paths.deleteUser])
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
