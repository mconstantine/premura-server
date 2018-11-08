const makeUpdatePeople = require('./make-updatePeople')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('updatePeople', () => {
  const createError = (code, message) => [code, message]
  const getProjectFromDbResult = { test: true }
  const getProjectFromDb = jest.fn(() => getProjectFromDbResult)
  const updatePeople = makeUpdatePeople({ getDb, ObjectID, createError, getProjectFromDb })

  const people = [
    { _id: 'personone' },
    { _id: 'persontwo' }
  ]

  const id = '1234567890abcdef'
  const req = { params: { id }, body: { people } }
  const res = { send: jest.fn() }
  const next = jest.fn()

  const project = {
    people: [
      { _id: new ObjectID('personone') },
      { _id: new ObjectID('persontwo')}
    ]
  }
  getDb.setResult('findOne', project)

  it('Should check that the project exists', async () => {
    await updatePeople(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(id)
    })
  })

  it('Should check that the people are assigned to the project', async () => {
    req.body = {
      people: [
        { _id: 'persontwo' },
        { _id: 'personthree' }
      ]
    }

    await updatePeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('personthree')])
  })

  it("Should ignore budgets if the project doesn't have a budget", async () => {
    delete project.budget
    req.body = { people }

    await updatePeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(expect.any(Object), {
      $set: expect.objectContaining({ people: [
        expect.not.objectContaining({ budget: expect.any(Number) }),
        expect.not.objectContaining({ budget: expect.any(Number) })
      ] })
    })
  })

  it('Should check that budgets add up if needed', async () => {
    project.budget = 42
    req.body.people = JSON.parse(JSON.stringify(people))
    req.body.people[0].budget = 21
    req.body.people[1].budget = 26
    await updatePeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([422, expect.stringContaining('budgets')])
  })

  it('Should not save any additional information', async () => {
    const extra = 'I shall not be saved'
    req.body.people = JSON.parse(JSON.stringify(people))
    req.body.people[0].extra = extra

    await updatePeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(expect.any(Object), {
      $set: expect.objectContaining({ people: [
        expect.not.objectContaining({ extra }),
        expect.anything()
      ] })
    })
  })

  it('Should return the updated project', async () => {
    res.send.mockClear()
    getProjectFromDb.mockClear()
    await updatePeople(req, res, next)
    expect(getProjectFromDb).toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })
})
