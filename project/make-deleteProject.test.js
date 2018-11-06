const makeDeleteProject = require('./make-deleteProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('deleteProject', () => {
  const createError = (code, message) => [code, message]
  const deleteProject = makeDeleteProject({ getDb, ObjectID, createError })
  const id = '1234567890abcdef'
  const req = { params: { id } }
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

  it.skip("Should remove project from the terms' projects", async () => {})
})
