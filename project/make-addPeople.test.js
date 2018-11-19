const makeAddPeople = require('./make-addPeople')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('addPeople', () => {
  let userCanReadProjectResult = true
  let getProjectFromDbResult = { test: true }
  const userCanReadProject = () => userCanReadProjectResult
  const createError = (httpCode, message) => [httpCode, message]
  const getProjectFromDb = () => getProjectFromDbResult
  const addPeople = makeAddPeople({ getDb, ObjectID, createError, getProjectFromDb, userCanReadProject })
  const id = '1234567890abcdef'
  const req = {
    session: { user: { _id: 'me' } },
    params: { id },
    body: {
      people: [
        { _id: 'someuserid' },
        { _id: 'anotheruserid' }
      ]
    }
  }

  const res = { send: jest.fn() }
  const next = jest.fn()
  const project = { people: [] }
  const users = [{
    _id: 'someuserid'
  }, {
    _id: 'anotheruserid'
  }]

  getDb.setResult('find', users)

  it('Should check that the project exist', async () => {
    getDb.setResult('findOne', false)
    await addPeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getDb.setResult('findOne', project)
  })

  it("Should return 401 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await addPeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it('Should check that people exist', async () => {
    getDb.functions.find.mockClear()
    getDb.setResult('find', users)
    await addPeople(req, res, next)
    expect(getDb.functions.find).toHaveBeenLastCalledWith({
      _id: { $in: req.body.people.map(({ _id }) => new ObjectID(_id)) }
    }, expect.anything())
  })

  it('Should not save the same person twice', async () => {
    getDb.functions.updateOne.mockClear()
    project.people = users
    await addPeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: { people: users } }
    )
    project.people = []
  })

  it('Should redistribute budget if needed', async () => {
    getDb.functions.updateOne.mockClear()
    project.budget = 41
    await addPeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: { people: [
        expect.objectContaining({ budget: 21 }),
        expect.objectContaining({ budget: 20 })
      ] } }
    )
    delete project.budget
  })

  it('Should return the updated project', async () => {
    res.send.mockClear()
    await addPeople(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })
})
