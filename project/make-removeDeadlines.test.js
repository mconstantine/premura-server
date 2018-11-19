const makeRemoveDeadlines = require('./make-removeDeadlines')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('removeDeadlines', () => {
  let userCanReadProjectResult = true
  const getProjectFromDbResult = { test: true }
  const createError = (httpCode, message) => [httpCode, message]
  const getProjectFromDb = () => getProjectFromDbResult
  const userCanReadProject = () => userCanReadProjectResult
  const removeDeadlines = makeRemoveDeadlines({
    getDb, ObjectID, createError, getProjectFromDb, userCanReadProject
  })

  const id = '1234567890abcdef'
  const now = new Date()

  const deadlines = [
    new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),
    new Date(now.getTime() + 1000 * 60 * 60 * 48).toISOString()
  ]

  const req = {
    session: { user: { _id: 'me' } },
    params: { id },
    body: { deadlines }
  }

  const getProject = () => ({
    deadlines: [
      new Date(now.getTime() + 1000 * 60 * 60 * 24),
      new Date(now.getTime() + 1000 * 60 * 60 * 48),
      new Date(now.getTime() + 1000 * 60 * 60 * 72)
    ]
  })

  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  getDb.setResult('findOne', getProject())

  it('Should check that the project exists', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    await removeDeadlines(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('project')])
    getDb.setResult('findOne', getProject())
  })

  it("Should return 401 if the user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await removeDeadlines(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.stringContaining('project')])
    userCanReadProjectResult = true
  })

  it('Should return the updated project', async () => {
    res.send.mockClear()
    getDb.functions.updateOne.mockClear()
    await removeDeadlines(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(id)
    }, {
      $set: { deadlines: [getProject().deadlines[2]] }
    })
  })
})
