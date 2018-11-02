const makeCreateUser = require('./make-createUser')
const roles = Array.from(require('../misc/roles'))
const getDb = require('../misc/test-getDb')


roles.includes = jest.fn(() => true)

describe('createUser', () => {
  const sensitiveInformationProjection = { test: true }
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

  const createUser = makeCreateUser({
    bcrypt, createError, roles, getDb, sensitiveInformationProjection
  })

  getDb.setResult('insertOne', { insertedId: '1234567890abcdef' })

  it('Should check for existing users', async () => {
    getDb.functions.findOne.mockClear()
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ email: data.email }, expect.anything())
  })

  it("Should check for the logged in user's role", async () => {
    const requestFromSameRole = Object.assign({}, req)
    requestFromSameRole.session.user.role = 'maker'
    requestFromSameRole.body = Object.assign({}, data)
    requestFromSameRole.body.role = 'maker'
    await createUser(requestFromSameRole, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it('Should create a new user', async () => {
    getDb.functions.insertOne.mockClear()
    req.session.user = Object.assign({}, data)
    req.session.user.role = 'master'
    req.body = Object.assign({}, data)
    await createUser(req, res, next)

    const result = Object.assign({}, data)
    delete result.passwordConfirmation
    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.objectContaining(result))
  })

  it('Should save the registration date', async () => {
    getDb.functions.insertOne.mockClear()
    req.session.user = Object.assign({}, data)
    req.session.user.role = 'master'
    req.body = Object.assign({}, data)
    await createUser(req, res, next)

    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      registrationDate: expect.any(Date)
    }))
  })

  it('Should encrypt the password', async () => {
    bcrypt.hash.mockClear()
    req.session.user = Object.assign({}, data)
    req.session.user.role = 'master'
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(bcrypt.hash).toHaveBeenCalledWith(data.password, 10)
  })

  it('Should report the conflict in case of existing user', async () => {
    getDb.setResult('findOne', { test: true })
    req.session.user = Object.assign({}, data)
    req.session.user.role = 'master'
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(next).toHaveBeenLastCalledWith([409, JSON.stringify(getDb.getResult('findOne'))])
    getDb.setResult('findOne', null)
  })

  it('Should hide sensible information', async () => {
    getDb.functions.findOne.mockClear()
    req.session.user = Object.assign({}, data)
    req.session.user.role = 'master'
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith(expect.anything(), {
      projection: expect.objectContaining(sensitiveInformationProjection)
    })
  })

  it('Should return the new user id', async () => {
    req.session.user = Object.assign({}, data)
    req.session.user.role = 'master'
    req.body = Object.assign({}, data)
    await createUser(req, res, next)
    expect(res.send).toHaveBeenCalledWith({ _id: getDb.getResult('insertOne').insertedId })
  })
})
