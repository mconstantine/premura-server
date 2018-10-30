const makeCreateUser = require('./make-createUser')
const roles = Array.from(require('../misc/roles'))

let findOneResult
let insertOneResult = { insertedId: '1234567890abcdef' }

roles.includes = jest.fn(() => true)

describe('createUser', () => {
  const data = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    passwordConfirmation: 'password',
    role: 'maker',
    jobRole: 'Technologist'
  }

  const bcrypt = { hash: jest.fn(x => x) }
  const createError = jest.fn((code, message) => [code, message])
  const req = { session: { user: { role: 'master' } } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  const findOne = jest.fn(() => findOneResult)
  const insertOne = jest.fn(() => insertOneResult)
  const collection = () => ({ findOne, insertOne })
  const getDb = () => ({ collection })

  const createUser = makeCreateUser({ bcrypt, createError, roles, getDb })

  it('Should check for existing users', async () => {
    findOne.mockClear()
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(findOne).toHaveBeenCalledWith({ email: data.email })
  })

  it("Should check for the logged in user's role", async () => {
    const requestFromLowerRole = Object.assign({}, req)
    requestFromLowerRole.session.user.role = 'maker'
    requestFromLowerRole.body = Object.assign({}, data)
    requestFromLowerRole.body.role = 'manager'
    await createUser(requestFromLowerRole, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it('Should create a new user', async () => {
    insertOne.mockClear()
    req.body = Object.assign({}, data)
    await createUser(req, res, next)

    const result = Object.assign({}, data)
    delete result.passwordConfirmation
    expect(insertOne).toHaveBeenCalledWith(expect.objectContaining(result))
  })

  it('Should save the registration date', async () => {
    insertOne.mockClear()
    req.body = Object.assign({}, data)
    await createUser(req, res, next)

    expect(insertOne).toHaveBeenCalledWith(expect.objectContaining({
      registrationDate: expect.any(Date)
    }))
  })

  it('Should encrypt the password', async () => {
    bcrypt.hash.mockClear()
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(bcrypt.hash).toHaveBeenCalledWith(data.password, 10)
  })

  it('Should report the conflict in case of existing user', async () => {
    findOneResult = { test: true }
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([409, JSON.stringify(findOneResult)])
    findOneResult = null
  })

  it('Should hide sensible data when reporting a conflict', async () => {
    next.mockClear()
    findOneResult = {
      test: true,
      email: 'should be hidden',
      password: 'should be hidden',
      registrationDate: 'should be hidden',
      lastLoginDate: 'should be hidden',
    }

    req.body = Object.assign({}, data)
    await createUser(req, res, next)

    const result = JSON.parse(next.mock.calls.pop()[0][1])

    expect(result).not.toHaveProperty('email')
    expect(result).not.toHaveProperty('password')
    expect(result).not.toHaveProperty('registrationDate')
    expect(result).not.toHaveProperty('lastLoginDate')

    findOneResult = null
  })

  it('Should return the new user id', async () => {
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(res.send).toHaveBeenCalledWith({ _id: insertOneResult.insertedId })
  })
})
