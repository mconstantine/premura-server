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
  const trim = s => s
  const bcrypt = { hash: () => '3ncrypt3d' }
  const updateUser = makeUpdateUser({ createError, ObjectID, getDb, roles, trim, bcrypt })

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
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
  })

  it("Should allow a user with a higher level to change a user's role", async () => {
    const role = 'master'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'manager' }
    req.body = { role }
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ role })
    )
  })

  it('Should allow a user to change its own email', async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { email }
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ email })
    )
  })

  it("Should allow a master to change anyone's email", async () => {
    const email = 'whatever@example.com'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { email }
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ email })
    )
  })

  it('Should allow a user to change its own password', async () => {
    const password = 'password'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { password }
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ password: bcrypt.hash(password) })
    )
  })

  it("Should allow a master to change anyone's password", async () => {
    const password = 'password'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker' }
    req.session.user = { _id: 'notMe', role: 'master' }
    req.body = { password }
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ password: bcrypt.hash(password) })
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

  // Should not allow a user to change another user's name

  it('Should allow a user to change its own name', async () => {
    const name = 'name'
    next.mockClear()
    findOneResult = { _id: 'me', role: 'maker', name: 'whatever' }
    req.session.user = { _id: 'me', role: 'maker' }
    req.body = { name }
    await updateUser(req, null, next)
    expect(next).not.toHaveBeenCalled()
    expect(updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ name })
    )
  })

  // Should clean data
  // Should validate data
  // Should not save invalid properties
  // Should encrypt the password
  // Should delete call logout if email or password changed
})
