const createUser = require('./createUser')
const roles = Array.from(require('../misc/roles'))

roles.includes = jest.fn(() => true)

describe('createUser', () => {
  const completeData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    passwordConfirmation: 'password',
    role: 'maker'
  }

  const bcrypt = { hash: jest.fn(x => x) }
  const trim = jest.fn(x => x)
  const createError = jest.fn((code, message) => [code, message])
  const req = { session: { user: { role: 'master' } } }
  const res = { status: jest.fn(() => res), end: jest.fn() }
  const next = jest.fn()
  const isEmail = jest.fn(() => true)

  const findOne = jest.fn()
  const insertOne = jest.fn()
  const collection = jest.fn(() => ({ findOne, insertOne }))
  const getDb = () => ({ collection })

  const doCreateUser = createUser({ bcrypt, trim, createError, isEmail, roles, getDb })

  it('Should clean data', async () => {
    req.body = Object.assign({}, completeData)

    await doCreateUser(req, res, next)

    expect(trim).toHaveBeenNthCalledWith(1, completeData.name)
    expect(trim).toHaveBeenNthCalledWith(2, completeData.email)
    expect(trim).toHaveBeenNthCalledWith(3, completeData.password)
    expect(trim).toHaveBeenNthCalledWith(4, completeData.passwordConfirmation)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.end).toHaveBeenCalled()
  })

  it('Should validate data', async () => {
    isEmail.mockClear()
    roles.includes.mockClear()

    req.body = Object.assign({}, completeData)
    await doCreateUser(req, res, next)
    expect(isEmail).toHaveBeenCalledWith(completeData.email)
    expect(roles.includes).toHaveBeenCalledWith(completeData.role)

    next.mockClear()

    req.body = Object.assign({}, completeData)
    req.body.name = ''
    await doCreateUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('name')])

    req.body = Object.assign({}, completeData)
    req.body.email = ''
    await doCreateUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('email')])

    req.body = Object.assign({}, completeData)
    req.body.password = ''
    await doCreateUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('password')])

    req.body = Object.assign({}, completeData)
    req.body.passwordConfirmation = ''
    await doCreateUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('passwordConfirmation')])

    req.body.passwordConfirmation = 'somethingelse'
    await doCreateUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('password')])
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('passwordConfirmation')])

    req.body = Object.assign({}, completeData)
    req.body.role = ''
    await doCreateUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('role')])
  })

  it('Should check for existing users', async () => {
    collection.mockClear()
    findOne.mockClear()
    req.body = Object.assign({}, completeData)
    await doCreateUser(req, res, next)
    expect(collection).toHaveBeenCalledWith('users')
    expect(findOne).toHaveBeenCalledWith({ email: completeData.email })
  })

  it("Should check for the logged in user's role", async () => {
    const requestFromLowerRole = Object.assign({}, req)
    requestFromLowerRole.session.user.role = 'maker'
    requestFromLowerRole.body = Object.assign({}, completeData)
    requestFromLowerRole.body.role = 'manager'
    await doCreateUser(requestFromLowerRole, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it('Should create a new user', async () => {
    collection.mockClear()
    insertOne.mockClear()
    req.body = Object.assign({}, completeData)
    await doCreateUser(req, res, next)

    const result = Object.assign({}, completeData)
    delete result.passwordConfirmation

    expect(collection).toHaveBeenCalledWith('users')
    expect(insertOne).toHaveBeenCalledWith(result)
  })

  it('Should encrypt the password', async () => {
    bcrypt.hash.mockClear()
    req.body = Object.assign({}, completeData)
    await doCreateUser(req, res, next)
    expect(bcrypt.hash).toHaveBeenCalledWith(completeData.password, 10)
  })
})
