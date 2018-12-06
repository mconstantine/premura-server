const makeGetActivity = require('./make-getActivity')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('getActivity', () => {
  const createError = (httpCode, message) => [httpCode, message]

  let userCanReadProjectResult = true
  let getActivityFromDbResult = { project: { _id: new ObjectID('aprojectid') } }

  const getActivityFromDb = jest.fn(() => getActivityFromDbResult)
  const userCanReadProject = () => userCanReadProjectResult
  const getActivity = makeGetActivity({
    getDb, ObjectID, createError, getActivityFromDb, userCanReadProject, gt
  })
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: 'me' } }, params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  it('Should check that the id is valid', async () => {
    req.params = {}
    await getActivity(req, res)
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

  it('Should check that the activity exists', async () => {
    next.mockClear()
    const originalGetActivityFromDbResult = getActivityFromDbResult
    getActivityFromDbResult = false
    await getActivity(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getActivityFromDbResult = originalGetActivityFromDbResult
  })

  it('Should return the project', async () => {
    res.send.mockClear()
    await getActivity(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getActivityFromDbResult)
  })

  it("Should return 401 if the current user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await getActivity(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })
})
