const makeGetProject = require('./make-getProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('getProject', () => {
  const createError = (code, message) => [code, message]
  let getProjectFromDBResult = { test: true }
  const getProjectFromDB = jest.fn(() => getProjectFromDBResult)
  const getProject = makeGetProject({
    getDb, ObjectID, createError, getProjectFromDB
  })
  const id = '1234567890abcdef'
  const req = { params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  it('Should check that the id is valid', async () => {
    req.params = {}
    await getProject(req, res)
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
    getProjectFromDBResult = false
    await getProject(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getProjectFromDBResult = { test: true }
  })

  it('Should return the project', async () => {
    res.send.mockClear()
    await getProject(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDBResult)
  })
})
