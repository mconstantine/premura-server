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
    req.body = { name }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      people: [expect.objectContaining({ _id: req.session.user._id })]
    }))
  })

  it('Should assign the budget to the project creator if needed', async () => {
    req.body = { name, budget: 42 }
    await createProject(req, res, next)
    expect(getDb.functions.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      people: [expect.objectContaining({
        _id: req.session.user._id,
        budget: 42
      })]
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
