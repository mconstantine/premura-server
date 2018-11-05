const makeCreateProject = require('./make-createProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('createProject', () => {
  const createError = (code, message) => [code, message]
  const createProject = makeCreateProject({ getDb, ObjectID, createError })

  const name = 'Project name'
  const req = { session: { user: { _id: 'me' } } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  getDb.setResult('insertOne', { insertedId: '1234567890abcdef' })

  it('Should support the minimal form (name only)', async () => {
    next.mockClear()
    req.body = { name }
    await createProject(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.not.objectContaining({
      description: expect.anything()
    }))
  })

  it('Should create a people Array with the project creator by default', async () => {
    req.body = { name }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      people: [expect.objectContaining({ _id: req.session.user._id })]
    }))
  })

  it('Should always add the project creator to people', async () => {
    const _id = 'someone else'
    req.body = { name, people: [{ _id }] }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      people: [
        expect.objectContaining({ _id }),
        expect.objectContaining({ _id: req.session.user._id })
      ]
    }))
  })

  it('Should check that people exist', async () => {
    const _id = 'someone else'
    req.body = { name, people: [{ _id }] }
    await createProject(req, res, next)
    expect(getDb.functions.find).toHaveBeenLastCalledWith(
      { _id: { $in: [new ObjectID(_id)] } },
      expect.any(Object)
    )
  })

  it('Should divide the budget between people if provided and not already divided', async () => {
    // Not divided budget. We also test that odd numbers result in the first person having +1 budget
    const _id = 'someone else'
    req.body = {
      name,
      people: [{ _id }, { _id: req.session.user._id }],
      budget: 21
    }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(expect.objectContaining({
      people: [
        expect.objectContaining({ budget: 11 }),
        expect.objectContaining({ budget: 10 })
      ]
    }))

    // Already divided budget
    req.body = {
      name,
      people: [{ _id, budget: 5 }, { _id: req.session.user._id, budget: 16 }],
      budget: 21
    }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(expect.objectContaining({
      people: [
        expect.objectContaining({ budget: 5 }),
        expect.objectContaining({ budget: 16 })
      ]
    }))
  })

  it('Should create a deadlines Array by default', async () => {
    req.body = { name }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(expect.objectContaining({
      deadlines: []
    }))
  })

  it('Should set the status to opened by default', async () => {
    req.body = { name }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(expect.objectContaining({
      status: 'opened'
    }))
  })

  it('Should return the inserted ID', async () => {
    res.send.mockClear()
    req.body = { name }
    await createProject(req, res, next)
    const _id = getDb.getResult('insertOne').insertedId
    expect(_id).toBeTruthy()
    expect(res.send).toHaveBeenCalledWith({ _id })
  })
})
