const makeDeleteUser = require('./make-deleteUser')
const roles = require('../misc/roles')

describe('deleteUser', () => {
  const _id = '1234567890abcdef'
  const req = { params: { id: _id }, session: { user: { role: 'master' } } }
  const next = jest.fn()
  const createError = (code, message) => [code, message]
  const findOneResult = { _id, role: 'maker' }
  const findOne = jest.fn(() => findOneResult)
  const deleteOne = jest.fn()
  const collection = () => ({ findOne, deleteOne })
  const getDb = () => ({ collection })
  const res = { end: () => {} }

  let shouldObjectIDFail = false

  class ObjectID {
    constructor(string) {
      if (shouldObjectIDFail) {
        throw new Error('Failing!')
      }

      this.string = string
    }

    equals(string) {
      return string === this.string
    }
  }

  const deleteUser = makeDeleteUser({ createError, getDb, ObjectID, roles })

  it('Should check that an ID is provided', async () => {
    req.params = {}
    await deleteUser(req, null, next)
    expect(next).toHaveBeenCalledWith([400, expect.stringContaining('id')])
    req.params = { id: _id }
  })

  it('Should handle ObjectID failing', async () => {
    shouldObjectIDFail = true
    await deleteUser(req, null, next)
    expect(next).toHaveBeenCalledWith([404, expect.any(String)])
    shouldObjectIDFail = false
  })

  it('Should check for the user existence', async () => {
    findOne.mockClear()
    await deleteUser(req, res, next)
    expect(findOne).toHaveBeenCalledWith({ _id: new ObjectID(_id) })
  })

  it('Should not allow the deletion of a user with higher or equal role', async () => {
    req.session.user.role = 'maker'
    await deleteUser(req, res, next)
    expect(next).toHaveBeenCalledWith([401, expect.any(String)])
    req.session.user.role = 'master'
  })
})
