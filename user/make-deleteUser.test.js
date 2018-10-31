const makeDeleteUser = require('./make-deleteUser')
const roles = require('../misc/roles')

describe('deleteUser', () => {
  const _id = '1234567890abcdef'
  let findOneResult = { _id, role: 'maker' }
  const req = { params: { id: _id }, session: { user: { role: 'master' } } }
  const next = jest.fn()
  const createError = (code, message) => [code, message]
  const findOne = jest.fn(() => findOneResult)
  const deleteOne = jest.fn()
  const collection = () => ({ findOne, deleteOne })
  const getDb = () => ({ collection })
  const res = { status: jest.fn(() => res), send: jest.fn(), end: () => {} }

  class ObjectID {
    constructor(string) {
      this.string = string
    }

    static isValid(string) {
      return !!string
    }

    equals(string) {
      return string === this.string
    }
  }

  const deleteUser = makeDeleteUser({ createError, getDb, ObjectID, roles })

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
    findOne.mockClear()
    await deleteUser(req, res, next)
    expect(findOne).toHaveBeenCalledWith({ _id: new ObjectID(_id) })
  })

  it('Should not allow a non master user to delete a user', async () => {
    req.session.user.role = 'manager'
    findOneResult = { role: 'maker' }
    await deleteUser(req, res, next)
    expect(next).toHaveBeenCalledWith([401, expect.any(String)])
  })

  it('Should allow a master user to delete a user', async () => {
    next.mockClear()
    deleteOne.mockClear()
    req.session.user.role = 'master'
    findOneResult = { role: 'master' }
    await deleteUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(deleteOne).toHaveBeenCalled()
  })
})
