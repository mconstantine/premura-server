const makeUpdateUser = require('./make-updateUser')
const roles = require('../misc/roles')
const ObjectID = require('../misc/test-ObjectID')
const getDb = require('../misc/test-getDb')

describe('updateUser', () => {
  getDb.setResult('findOne', true)

  const id = '1234567890abcdef'
  const req = { params: { id }, session: {} }
  const next = jest.fn()
  const createError = (httpCode, message) => [httpCode, message]
  const bcrypt = { hash: jest.fn(() => '3ncrypt3d') }
  const sensitiveInformationProjection = {}
  const updateUser = makeUpdateUser({
    createError, ObjectID, getDb, roles, bcrypt, sensitiveInformationProjection
  })

  const res = { status: jest.fn(() => res), end: jest.fn(), send: jest.fn() }

  const masterUserData = {
    _id: new ObjectID('me'),
    name: 'name',
    email: 'email@example.com',
    password: 'password',
    role: 'master',
    isActive: true
  }

  getDb.setResult('findOneAndUpdate', (filter, update) => {
    return { value: Object.assign(masterUserData, update.$set) }
  })

  it('Should check that a user ID is provided', async () => {
    req.params = {}
    await updateUser(req, res, next)
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid user id'
      }]
    })
    req.params = { id }
  })

  it('Should check for the user existance', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.anything()])
    getDb.setResult('findOne', true)
  })

  it("Should not allow a user with a lower or equal level to change a user's role", async () => {
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
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
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'me', role: 'manager' }
    req.body = { role }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ role }) },
      expect.anything()
    )
  })

  it('Should allow a user to change its own email', async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    const originalFindOne = getDb.functions.findOne
    getDb.functions.findOne = function(query) {
      if (query._id) {
        return { _id: 'me', role: 'maker' }
      } else {
        return false
      }
    }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { email }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ email }) },
      expect.anything()
    )
    getDb.functions.findOne = originalFindOne
  })

  it('Should allow a user to change its own lang', async () => {
    const lang = 'lang'
    next.mockClear()
    const originalFindOne = getDb.functions.findOne
    getDb.functions.findOne = function(query) {
      if (query._id) {
        return { _id: 'me', role: 'maker' }
      } else {
        return false
      }
    }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { lang }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ lang }) },
      expect.anything()
    )
    getDb.functions.findOne = originalFindOne
  })

  it("Should allow a master to change anyone's email", async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    const originalFindOne = getDb.functions.findOne
    getDb.functions.findOne = function(query) {
      if (query._id) {
        return { _id: 'me', role: 'maker' }
      } else {
        return false
      }
    }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { email }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ email }) },
      expect.anything()
    )
    getDb.functions.findOne = originalFindOne
  })

  it("Should allow a master to change anyone's lang", async () => {
    const lang = 'lang'
    next.mockClear()
    const originalFindOne = getDb.functions.findOne
    getDb.functions.findOne = function(query) {
      if (query._id) {
        return { _id: 'me', role: 'maker' }
      } else {
        return false
      }
    }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { lang }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ lang }) },
      expect.anything()
    )
    getDb.functions.findOne = originalFindOne
  })

  it('Should allow a user to change its own password', async () => {
    const password = 'password'
    next.mockClear()
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: bcrypt.hash(password) }) },
      expect.anything()
    )
  })

  it("Should allow a master to change anyone's password", async () => {
    const password = 'password'
    next.mockClear()
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: bcrypt.hash(password) }) },
      expect.anything()
    )
  })

  it("Should allow a master to change anyone's active state", async () => {
    const isActive = false
    next.mockClear()
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { isActive }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ isActive }) },
      expect.anything()
    )
  })

  it("Should not allow a non master user to change another user's email", async () => {
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'manager' }
    req.body = { email: 'whatever@example.com' }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it("Should not allow a non master user to change another user's password", async () => {
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'manager' }
    req.body = { password: 'password' }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it("Should not allow a non master user to change another user's lang", async () => {
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'manager' }
    req.body = { lang: 'lang' }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it("Should allow a master user to change another user's password", async () => {
    const password = 'password'
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: '3ncrypt3d' }) },
      expect.anything()
    )
  })

  it("Should not allow a non master user to change another user's active state", async () => {
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'notMe', role: 'manager' }
    req.body = { isActive: false }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.stringContaining('active')])
  })

  it("Should not allow a user to change another user's name", async () => {
    const name = 'name'
    next.mockClear()
    getDb.setResult('findOne', { _id: 'me', role: 'maker', name: 'whatever' })
    req.session.user = { _id: 'notMe', role: 'maker' }
    req.body = { name }
    await updateUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
  })

  it('Should allow a user to change its own name', async () => {
    const name = 'name'
    next.mockClear()
    getDb.setResult('findOne', { _id: 'me', role: 'maker', name: 'whatever' })
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { name }
    await updateUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ name }) },
      expect.anything()
    )
  })

  it('Should encrypt the password', async () => {
    bcrypt.hash.mockClear()
    getDb.functions.findOneAndUpdate.mockClear()
    const password = 'password'
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'me', role: 'master' }
    req.body = { password }
    await updateUser(req, res, next)
    expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.anything())
    expect(getDb.functions.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ password: '3ncrypt3d' }) },
      expect.anything()
    )
  })

  it('Should not save invalid properties', async () => {
    getDb.setResult('findOne', Object.assign({}, masterUserData, { role: 'maker' }))
    req.session.user = Object.assign({}, masterUserData)
    req.body = Object.assign({}, masterUserData)
    req.body.answer = 41
    await updateUser(req, res, next)
    expect(getDb.functions.findOneAndUpdate).not.toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ answer: 41 }),
      expect.anything()
    )
  })

  it('Should not override _id', async () => {
    getDb.setResult('findOne', Object.assign({}, masterUserData, { role: 'maker' }))
    req.session.user = Object.assign({}, masterUserData)
    req.body = Object.assign({}, masterUserData)
    await updateUser(req, res, next)
    expect(getDb.functions.findOneAndUpdate).not.toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ _id: masterUserData._id }),
      expect.anything()
    )
  })

  it('Should update the session if needed (same user)', async () => {
    res.send.mockClear()
    getDb.setResult('findOne', Object.assign({}, masterUserData))
    req.session.user = Object.assign({}, masterUserData)
    req.body = { name: 'whatever' }
    await updateUser(req, res, next)
    expect(req.session.user.name).toBe('whatever')
  })

  it('Should not update the session if not needed', async () => {
    res.send.mockClear()
    getDb.setResult('findOne', { _id: new ObjectID('me'), role: 'maker' })
    req.session.user = { _id: 'me', role: 'master' }
    req.body = { name: 'whatever' }
    await updateUser(req, res, next)
    expect(req.session.user.name).not.toBe('whatever')
  })

  it('Should logout if email or password changed', async () => {
    req.session.user = Object.assign({}, masterUserData)
    const originalFindOne = getDb.functions.findOne
    getDb.functions.findOne = function(query) {
      if (query._id) {
        return { _id: 'me', role: 'maker' }
      } else {
        return false
      }
    }

    req.body = { email: 'whatever@example.com' }
    await updateUser(req, res, next)
    expect(req.session.user).not.toBeDefined()

    req.session.user = Object.assign({}, masterUserData)
    req.body = { password: 'password' }
    await updateUser(req, res, next)

    expect(req.session.user).not.toBeDefined()
    getDb.functions.findOne = originalFindOne
  })

  it('Should return the updated user', async () => {
    const isActive = false

    getDb.setResult('findOne', Object.assign({}, masterUserData))
    req.session.user = Object.assign({}, masterUserData)
    req.body = { isActive }

    await updateUser(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(expect.objectContaining({ isActive }))
  })

  it('Should keep the emails unique', async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    const originalFindOne = getDb.functions.findOne
    getDb.functions.findOne = function(query) {
      if (query._id) {
        return { _id: 'me', role: 'maker' }
      } else {
        return { email }
      }
    }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { email }
    await updateUser(req, res, next)

    expect(next).toHaveBeenLastCalledWith([409, {
      msg: expect.any(String),
      conflict: { email }
    }])

    getDb.functions.findOne = originalFindOne
  })

  it('Should update the last update date', async () => {
    getDb.setResult('findOne', Object.assign({}, masterUserData))
    req.session.user = Object.assign({}, masterUserData)
    req.body = { isActive: true }
    getDb.functions.findOneAndUpdate.mockClear()
    await updateUser(req, res, next)
    expect(getDb.functions.findOneAndUpdate).toHaveBeenCalledWith(expect.any(Object), {
      $set: expect.objectContaining({
        lastUpdateDate: expect.any(Date)
      })
    }, expect.any(Object))
  })
})
