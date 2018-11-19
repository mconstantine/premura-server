const makeAddDeadlines = require('./make-addDeadlines')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('addDeadlines', () => {
  let userCanReadProjectResult = true
  const getProjectFromDbResult = { test: true }
  const createError = (httpCode, message) => [httpCode, message]
  const getProjectFromDb = () => getProjectFromDbResult
  const userCanReadProject = () => userCanReadProjectResult
  const addDeadlines = makeAddDeadlines({
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
    deadlines: []
  })

  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  getDb.setResult('findOne', getProject())

  it('Should check that the project exists', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    await addDeadlines(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('project')])
    getDb.setResult('findOne', getProject())
  })

  it("Should return 401 if the user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await addDeadlines(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.stringContaining('project')])
    userCanReadProjectResult = true
  })

  it('Should check that deadlines are in the future or today', async () => {
    res.status.mockClear()
    res.send.mockClear()

    req.body.deadlines = [
      now.toISOString(),
      new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString()
    ]

    await addDeadlines(req, res, next)
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: "body",
        param: "deadlines[1]",
        value: req.body.deadlines[1],
        msg: "deadlines should be today or in the future"
      }]
    })

    req.body.deadlines = deadlines
  })

  it('Should not duplicate deadlines', async () => {
    getDb.functions.updateOne.mockClear()
    const project = getProject()
    project.deadlines = deadlines.map(deadline => new Date(deadline))
    getDb.setResult('findOne', project)
    await addDeadlines(req, res, next)
    const update = getDb.functions.updateOne.mock.calls.pop()
    expect(update[1].$set.deadlines.length).toBe(2)
    getDb.setResult('findOne', getProject())
  })

  it('Should return the updated project', async () => {
    res.send.mockClear()
    await addDeadlines(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })
})
