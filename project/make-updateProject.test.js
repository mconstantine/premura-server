const makeUpdateProject = require('./make-updateProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('updateProject', () => {
  let userCanReadProjectResult = true
  const userCanReadProject = () => userCanReadProjectResult
  const createError = (httpCode, message) => [httpCode, message]
  const updateProject = makeUpdateProject({ getDb, ObjectID, createError, userCanReadProject })
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: 'me' } }, params: { id }, body: {} }
  const res = { send: jest.fn() }
  const next = jest.fn()

  const project = {
    name: 'A name',
    description: 'A description',
    people: [],
    deadlines: []
  }

  getDb.setResult('findOne', project)

  it('Should check that the project exists', async () => {
    getDb.setResult('findOne', false)
    await updateProject(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getDb.setResult('findOne', project)
  })

  it("Should return 401 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await updateProject(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it('Should not update if no update is provided', async () => {
    next.mockClear()
    req.body = {}
    getDb.functions.updateOne.mockClear()
    await updateProject(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.updateOne).not.toHaveBeenCalled()
  })

  it('Should update name', async () => {
    const name = 'A name'
    req.body.name = name
    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: expect.objectContaining({ name }) }
    )
  })

  it('Should update description', async () => {
    const description = 'A description'
    req.body.description = description
    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: expect.objectContaining({ description }) }
    )
  })

  it('Should update budget', async () => {
    const budget = 42
    req.body.budget = budget
    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: expect.objectContaining({ budget }) }
    )
  })

  it('Should redistribute budget (budget already ok)', async () => {
    const projectWithPeople = JSON.parse(JSON.stringify(project))
    projectWithPeople.people = [{ budget: 20 }, { budget: 30 }]
    getDb.setResult('findOne', projectWithPeople)
    req.body = { budget: 50 }

    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(expect.any(Object), {
      $set: expect.not.objectContaining({ people: projectWithPeople.people })
    })

    getDb.setResult('findOne', project)
  })

  it('Should redistribute budget (floating budget per person, not ok)', async () => {
    const projectWithPeople = JSON.parse(JSON.stringify(project))
    projectWithPeople.people = [{ budget: 20 }, { budget: 30 }]
    getDb.setResult('findOne', projectWithPeople)
    req.body = { budget: 41 }

    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(expect.any(Object), {
      $set: expect.objectContaining({
        people: [{ budget: 21 }, { budget: 20 }]
      })
    })

    getDb.setResult('findOne', project)
  })

  it('Should update status', async () => {
    const status = 'cold'
    req.body.status = status
    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: expect.objectContaining({ status }) }
    )
  })

  it('Should not save any extra information', async () => {
    const name = 'A name'
    const extra = 'I shall not be saved'
    req.body = { name, extra }
    await updateProject(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.any(Object),
      { $set: expect.not.objectContaining({ extra }) }
    )
  })
})
