const makeGetProject = require('./make-getProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('getProject', () => {
  const createError = (httpCode, message) => [httpCode, message]

  let userCanReadProjectResult = true
  let getProjectFromDbResult = { test: true }

  const getProjectFromDb = jest.fn(() => getProjectFromDbResult)
  const userCanReadProject = () => userCanReadProjectResult
  const getProject = makeGetProject({
    getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
  })
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: 'me' } }, params: { id } }
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
        msg: expect.any(String)
      }]
    })
    req.params = { id }
  })

  it('Should check that the project exist', async () => {
    next.mockClear()
    const originalGetProjectFromDbResult = getProjectFromDbResult
    getProjectFromDbResult = false
    await getProject(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getProjectFromDbResult = originalGetProjectFromDbResult
  })

  it('Should return the project', async () => {
    res.send.mockClear()
    await getProject(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })

  it("Should return 401 if the current user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await getProject(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })
})
