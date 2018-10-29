const makeUpdateUser = require('./make-updateUser')
const roles = require('../misc/roles')

describe('updateUser', () => {
  let shouldObjectIDFail = false
  class ObjectID {
    constructor(string) {
      if (shouldObjectIDFail) {
        throw new Error('Failing!')
      }

      this.string = string
    }

    equals(string) {
      return this.string === string
    }
  }

  let findOneResult = true
  const id = '1234567890abcdef'
  const req = { params: { id }, session: {} }
  const next = jest.fn()
  const createError = (code, message) => [code, message]
  const findOne = () => findOneResult
  const updateOne = jest.fn()
  const collection = () => ({ findOne, updateOne })
  const getDb = () => ({ collection })
  const trim = jest.fn(s => s)
  const bcrypt = { hash: jest.fn(() => '3ncrypt3d') }
  const isEmail = jest.fn(() => true)
  const updateUser = makeUpdateUser({ createError, ObjectID, getDb, roles, trim, bcrypt, isEmail })
  const res = { redirect: jest.fn(), send: jest.fn() }

  const masterUserData = {
    _id: 'me',
    name: 'name',
    email: 'email@example.com',
    password: 'password',
    role: 'master'
  }

  it('Should check that a user ID is provided', async () => {
    req.params = {}
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('id')])
    req.params = { id }
  })

  it('Should handle ObjectID failure', async () => {
    shouldObjectIDFail = true
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.anything()])
    shouldObjectIDFail = false
  })

  it('Should check for the user existance', async () => {
    next.mockClear()
    findOneResult = false
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.anything()])
    findOneResult = true
  })

  it("Should not allow a user with a lower or equal level to change a user's role", async () => {
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { role: 'master' }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])

    next.mockClear()
    delete req.body.role
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
  })

  it("Should allow a user with a higher level to change a user's role", async () => {
    const role = 'master'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'manager' }
    req.body = { role }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ role }) }
    )
  })

  it('Should allow a user to change its own email', async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { email }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ email }) }
    )
  })

  it("Should allow a master to change anyone's email", async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { email }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ email }) }
    )
  })

  it('Should allow a user to change its own password', async () => {
    const password = 'password'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: bcrypt.hash(password) }) }
    )
  })

  it("Should allow a master to change anyone's password", async () => {
    const password = 'password'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: bcrypt.hash(password) }) }
    )
  })

  it("Should not allow a non master user to change another user's email", async () => {
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'notMe', role: 'manager' }
    req.body = { email: 'whatever@example.com' }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it("Should not allow a non master user to change another user's password", async () => {
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'notMe', role: 'manager' }
    req.body = { password: 'password' }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it("Should not allow a user to change another user's name", async () => {
    const name = 'name'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker', name: 'whatever' }
    req.session.user = { _id: 'notMe', role: 'maker' }
    req.body = { name }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it('Should allow a user to change its own name', async () => {
    const name = 'name'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker', name: 'whatever' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { name }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ name }) }
    )
  })

  it('Should clean data', async () => {
    trim.mockClear()
    findOneResult = Object.assign({}, masterUserData)
    findOneResult.role = 'maker'
    req.session.user = Object.assign({}, masterUserData)
    req.body = Object.assign({}, masterUserData)
    await updateUser(req, res, next)

    expect(trim).toHaveBeenNthCalledWith(1, masterUserData.role)
    expect(trim).toHaveBeenNthCalledWith(2, masterUserData.email)
    expect(trim).toHaveBeenNthCalledWith(3, masterUserData.password)
    expect(trim).toHaveBeenNthCalledWith(4, masterUserData.name)
  })

  it('Should validate data', async () => {
    isEmail.mockClear()
    const email = 'whatever@example.com'
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'master' }
    req.body = { email }
    await updateUser(req, res, next)
    expect(isEmail).toHaveBeenCalledWith(email)

    req.body.role = 'hjsDJHVliug'
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('role')])
  })

  it('Should encrypt the password', async () => {
    bcrypt.hash.mockClear()
    updateOne.mockClear()
    const password = 'password'
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'master' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.anything())
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: '3ncrypt3d' }) }
    )
  })

  it('Should not save invalid properties', async () => {
    findOneResult = Object.assign({}, masterUserData)
    findOneResult.role = 'maker'
    req.session.user = Object.assign({}, masterUserData)
    req.body = Object.assign({}, masterUserData)
    req.body.answer = 41
    await updateUser(req, res, next)
    expect(updateOne).not.toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ answer: 41 })
    )
  })

  it('Should not override _id', async () => {
    findOneResult = Object.assign({}, masterUserData)
    findOneResult.role = 'maker'
    req.session.user = Object.assign({}, masterUserData)
    req.body = Object.assign({}, masterUserData)
    await updateUser(req, res, next)
    expect(updateOne).not.toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ _id: masterUserData._id })
    )
  })

  it('Should update the session', async () => {
    res.send.mockClear()
    findOneResult = Object.assign({}, masterUserData)
    req.session.user = Object.assign({}, masterUserData)
    req.body = { name: 'whatever' }
    await updateUser(req, res, next)
    expect(res.send).toHaveBeenCalled()
  })

  it('Should logout if email or password changed', async () => {
    res.redirect.mockClear()
    findOneResult = Object.assign({}, masterUserData)
    req.session.user = Object.assign({}, masterUserData)

    req.body = { email: 'whatever@example.com' }
    await updateUser(req, res, next)

    req.body = { password: 'password' }
    await updateUser(req, res, next)

    expect(res.redirect).toHaveBeenCalledTimes(2)
  })

  it('Should return the updated session', async () => {
    const name = 'New name'

    findOneResult = Object.assign({}, masterUserData)
    req.session.user = Object.assign({}, masterUserData)
    req.body = { name }

    await updateUser(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(expect.objectContaining({ name }))
  })
})
