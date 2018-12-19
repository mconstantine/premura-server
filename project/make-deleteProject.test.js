const makeDeleteProject = require('./make-deleteProject')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('deleteProject', () => {
  let userCanReadProjectResult = true
  const userCanReadProject = () => userCanReadProjectResult
  const createError = (httpCode, message) => [httpCode, message]
  const deleteProject = makeDeleteProject({ getDb, ObjectID, createError, userCanReadProject, gt })
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: 'me' } }, params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn(), end: jest.fn() }
  const next = jest.fn()

  const findOneResult = { _id: new ObjectID(id) }
  const getCategories = () => [{
    _id: new ObjectID('categoryoneid'),
    terms: [{
      projects: [new ObjectID(id)]
    }]
  }, {
    _id: new ObjectID('categorytwoid'),
    terms: [{
      projects: [new ObjectID(id), new ObjectID('somethingelse')]
    }]
  }]

  getDb.setResult('findOne', findOneResult)
  getDb.setResult('find', getCategories)

  it('Should check that the id is valid', async () => {
    res.end.mockClear()
    req.params = {}
    await deleteProject(req, res)
    expect(res.end).not.toHaveBeenCalled()
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

  it('Should check that the project exist', async () => {
    next.mockClear()
    res.end.mockClear()
    getDb.setResult('findOne', false)
    getDb.setResult('find', getCategories)
    await deleteProject(req, res, next)
    expect(res.end).not.toHaveBeenCalled()
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    getDb.setResult('findOne', findOneResult)
    getDb.setResult('find', getCategories)
  })

  it('Should work', async () => {
    res.end.mockClear()
    await deleteProject(req, res, next)
    expect(res.end).toHaveBeenCalled()
  })

  it("Should return 401 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await deleteProject(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it("Should remove project from the terms' projects", async () => {
    const categories = getCategories()
    getDb.functions.updateOne.mockClear()
    await deleteProject(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenCalledWith({ _id: categories[0]._id }, {
      $set: {
        terms: [{
          projects: []
        }]
      }
    })

    expect(getDb.functions.updateOne).toHaveBeenCalledWith({ _id: categories[1]._id }, {
      $set: {
        terms: [{
          projects: [categories[1].terms[0].projects[1]]
        }]
      }
    })
  })

  it("Should delete the project's conversation", async () => {
    await deleteProject(req, res, next)

    expect(getDb.functions.deleteMany).toHaveBeenLastCalledWith({
      project: new ObjectID(req.params.id)
    })
  })
})
