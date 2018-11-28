const makeRemovePeople = require('./make-removePeople')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('removePeople', () => {
  let userCanReadProjectResult = true
  const userCanReadProject = () => userCanReadProjectResult
  const createError = (httpCode, message) => [httpCode, message]
  const getProjectFromDbResult = { test: true }
  const getProjectFromDb = jest.fn(() => getProjectFromDbResult)
  const removePeople = makeRemovePeople({
    getDb, ObjectID, createError, getProjectFromDb, userCanReadProject
  })

  const getPeople = () => [
    { _id: 'someuserid' },
    { _id: 'anotheruserid' }
  ]

  const getProject = () => ({
    people: [
      { _id: new ObjectID('someuserid') },
      { _id: new ObjectID('anotheruserid') },
      { _id: new ObjectID('athirduserid') }
    ]
  })

  const next = jest.fn()
  const id = '1234567890abcdef'
  const req = {
    session: { user: { _id: 'me' } },
    params: { id },
    body: { people: getPeople() }
  }
  const res = { send: jest.fn() }

  getDb.setResult('findOne', getProject)

  it('Should work', async () => {
    next.mockClear()
    res.send.mockClear()
    getDb.functions.updateOne.mockClear()
    await removePeople(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.updateOne).toHaveBeenCalled()
  })

  it('Should check that the project exists', async () => {
    getDb.setResult('findOne', false)
    res.send.mockClear()
    await removePeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    expect(res.send).not.toHaveBeenCalled()
    getDb.setResult('findOne', getProject)
  })

  it("Should return 401 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await removePeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it('Should ensure that at least one person is assigned', async () => {
    res.send.mockClear()
    const project = getProject()
    req.body.people.push({ _id: project.people[2]._id.toString() })
    await removePeople(req, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith([422, expect.any(String)])
    req.body.people.pop()
  })

  it('Should redistribute budget if needed (floating budget)', async () => {
    const project = getProject()

    project.budget = 41
    project.people[0].budget = 15
    project.people[1].budget = 15
    project.people[2].budget = 11

    getDb.setResult('findOne', project)

    await removePeople(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(id)
    }, {
      $set: expect.objectContaining({
        people: [
          expect.objectContaining({ budget: 41 })
        ]
      })
    })

    getDb.setResult('findOne', getProject)
  })

  it('Should return the updated project', async () => {
    getProjectFromDb.mockClear()
    await removePeople(req, res, next)
    expect(getProjectFromDb).toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })

  it('Should update the last update date', async () => {
    getDb.functions.updateOne.mockClear()
    await removePeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledWith(expect.any(Object), {
      $set: expect.objectContaining({ lastUpdateDate: expect.any(Date) })
    })
  })
})
