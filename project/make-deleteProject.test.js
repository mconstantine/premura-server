const makeDeleteProject = require('./make-deleteProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('deleteProject', () => {
  let userCanReadProjectResult = true
  const userCanReadProject = () => userCanReadProjectResult
  const createError = (httpCode, message) => [httpCode, message]
  const deleteProject = makeDeleteProject({ getDb, ObjectID, createError, userCanReadProject })
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: 'me' } }, params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn(), end: jest.fn() }
  const next = jest.fn()

  const findOneResult = { test: true }
  getDb.setResult('findOne', findOneResult)

  it('Should check that the id is valid', async () => {
    res.end.mockClear()
    req.params = {}
    await deleteProject(req, res)
    expect(res.end).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid project id'
      }]
    })
    req.params = { id }
  })

  it('Should check that the project exist', async () => {
    next.mockClear()
    res.end.mockClear()
    getDb.setResult('findOne', false)
    await deleteProject(req, res, next)
    expect(res.end).not.toHaveBeenCalled()
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    getDb.setResult('findOne', findOneResult)
  })

  it('Should work', async () => {
    res.end.mockClear()
    await deleteProject(req, res, next)
    expect(res.end).toHaveBeenCalled()
  })

  it("Should return 401 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await deleteProject(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it.skip("Should remove project from the terms' projects", async () => {})
})
