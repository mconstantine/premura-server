const makeDeleteUser = require('./make-deleteUser')
const roles = require('../misc/roles')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('deleteUser', () => {
  const _id = '1234567890abcdef'
  const req = { params: { id: _id }, session: { user: { role: 'master' } } }
  const next = jest.fn()
  const createError = (httpCode, message) => [httpCode, message]
  const res = { status: jest.fn(() => res), send: jest.fn(), end: () => {} }
  const deleteUser = makeDeleteUser({ createError, getDb, ObjectID, roles })

  getDb.setResult('findOne', { _id, role: 'maker' })

  it('Should check that an ID is provided', async () => {
    req.params = {}
    await deleteUser(req, res, next)
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid user id'
      }]
    })

    req.params = { id: _id }
  })

  it('Should check for the user existence', async () => {
    getDb.functions.findOne.mockClear()
    await deleteUser(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: new ObjectID(_id) })
  })

  it('Should not allow a non master user to delete a user', async () => {
    req.session.user.role = 'manager'
    getDb.setResult('findOne', { role: 'maker' })
    await deleteUser(req, res, next)
    expect(next).toHaveBeenCalledWith([401, expect.any(String)])
  })

  it('Should allow a master user to delete a user', async () => {
    next.mockClear()
    getDb.functions.deleteOne.mockClear()
    req.session.user.role = 'master'
    getDb.setResult('findOne', { role: 'master' })
    await deleteUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.deleteOne).toHaveBeenCalled()
  })

  it.skip("Should remove user from projects' people", async () => {})
  it.skip('Should remove projects that have this user as the only person', async () => {})
})
