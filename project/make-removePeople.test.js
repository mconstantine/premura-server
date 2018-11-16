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

  const people = [
    { _id: 'someuserid' },
    { _id: 'anotheruserid' }
  ]

  const project = {
    people: [
      { _id: 'someuserid' },
      { _id: 'anotheruserid' },
      { _id: 'athirduserid' }
    ]
  }

  const getProject = () => JSON.parse(JSON.stringify(project))
  const prepare = () => getDb.setResult('findOne', getProject())
  const next = jest.fn()
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: 'me' } }, params: { id }, body: { people } }
  const res = { send: jest.fn() }

  it('Should work', async () => {
    prepare()
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
    getDb.setResult('findOne', getProject())
  })

  it("Should return 404 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await removePeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    userCanReadProjectResult = true
  })

  it('Should ensure that at least one person is assigned', async () => {
    prepare()
    res.send.mockClear()
    people.push(project.people[2])
    await removePeople(req, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith([422, expect.any(String)])
    people.pop()
  })

  it('Should redistribute budget if needed (floating budget)', async () => {
    prepare()
    const project = getDb.getResult('findOne')
    const secondPerson = people.pop()
    project.budget = 41
    project.people[0].budget = 15
    project.people[1].budget = 15
    project.people[2].budget = 11

    await removePeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(id)
    }, {
      $set: {
        people: [
          expect.objectContaining({ budget: 21 }),
          expect.objectContaining({ budget: 20 })
        ]
      }
    })

    people.push(secondPerson)
  })

  it('Should return the updated project', async () => {
    prepare()
    getProjectFromDb.mockClear()
    await removePeople(req, res, next)
    expect(getProjectFromDb).toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })
})
