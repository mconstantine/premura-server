const makeCreateUser = require('./make-createUser')
const roles = Array.from(require('../misc/roles'))

let findOneResult
let insertOneResult = { insertedId: '1234567890abcdef' }

roles.includes = jest.fn(() => true)

describe('createUser', () => {
  const completeData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    passwordConfirmation: 'password',
    role: 'maker',
    jobRole: 'Technologist'
  }

  const bcrypt = { hash: jest.fn(x => x) }
  const trim = jest.fn(x => x)
  const createError = jest.fn((code, message) => [code, message])
  const req = { session: { user: { role: 'master' } } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()
  const isEmail = jest.fn(() => true)

  const findOne = jest.fn(() => findOneResult)
  const insertOne = jest.fn(() => insertOneResult)
  const collection = jest.fn(() => ({ findOne, insertOne }))
  const getDb = () => ({ collection })

  const createUser = makeCreateUser({ bcrypt, trim, createError, isEmail, roles, getDb })

  it('Should clean data', async () => {
    req.body = Object.assign({}, completeData)

    await createUser(req, res, next)

    expect(trim).toHaveBeenNthCalledWith(1, completeData.name)
    expect(trim).toHaveBeenNthCalledWith(2, completeData.email)
    expect(trim).toHaveBeenNthCalledWith(3, completeData.password)
    expect(trim).toHaveBeenNthCalledWith(4, completeData.passwordConfirmation)
    expect(trim).toHaveBeenNthCalledWith(5, completeData.jobRole)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalled()
  })

  it('Should validate data', async () => {
    isEmail.mockClear()
    roles.includes.mockClear()

    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)
    expect(isEmail).toHaveBeenCalledWith(completeData.email)
    expect(roles.includes).toHaveBeenCalledWith(completeData.role)

    next.mockClear()

    req.body = Object.assign({}, completeData)
    req.body.name = ''
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('name')])

    req.body = Object.assign({}, completeData)
    req.body.email = ''
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('email')])

    req.body = Object.assign({}, completeData)
    req.body.password = ''
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('password')])

    req.body = Object.assign({}, completeData)
    req.body.passwordConfirmation = ''
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('passwordConfirmation')])

    req.body.passwordConfirmation = 'somethingelse'
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('password')])
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('passwordConfirmation')])

    req.body = Object.assign({}, completeData)
    req.body.role = ''
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('role')])

    req.body = Object.assign({}, completeData)
    req.body.jobRole = ''
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('jobRole')])
  })

  it('Should check for existing users', async () => {
    collection.mockClear()
    findOne.mockClear()
    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)
    expect(findOne).toHaveBeenCalledWith({ email: completeData.email })
  })

  it("Should check for the logged in user's role", async () => {
    const requestFromLowerRole = Object.assign({}, req)
    requestFromLowerRole.session.user.role = 'maker'
    requestFromLowerRole.body = Object.assign({}, completeData)
    requestFromLowerRole.body.role = 'manager'
    await createUser(requestFromLowerRole, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it('Should create a new user', async () => {
    collection.mockClear()
    insertOne.mockClear()
    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)

    const result = Object.assign({}, completeData)
    delete result.passwordConfirmation

    expect(insertOne).toHaveBeenCalledWith(result)
  })

  it('Should encrypt the password', async () => {
    bcrypt.hash.mockClear()
    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)
    expect(bcrypt.hash).toHaveBeenCalledWith(completeData.password, 10)
  })

  it('Should report the conflict in case of existing user', async () => {
    findOneResult = { test: true }
    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([409, JSON.stringify(findOneResult)])
    findOneResult = null
  })

  it('Should hide sensible data when reporting a conflict', async () => {
    next.mockClear()
    findOneResult = { test: true, email: 'should be hidden', password: 'should be hidden' }
    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)

    const result = JSON.parse(next.mock.calls.pop()[0][1])

    expect(result).not.toHaveProperty('email')
    expect(result).not.toHaveProperty('password')

    findOneResult = null
  })

  it('Should return the new user id', async () => {
    req.body = Object.assign({}, completeData)
    await createUser(req, res, next)
    expect(res.send).toHaveBeenCalledWith({ _id: insertOneResult.insertedId })
  })
})
