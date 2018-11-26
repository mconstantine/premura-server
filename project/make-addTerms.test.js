const makeAddTerms = require('./make-addTerms')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('addTerms', () => {
  let userCanReadProjectResult = true
  const getProjectFromDbResult = { test: true }
  const createError = (httpCode, message) => [httpCode, message]
  const userCanReadProject = () => userCanReadProjectResult
  const getProjectFromDb = jest.fn(() => getProjectFromDbResult)
  const addTerms = makeAddTerms({ getDb, ObjectID, createError, userCanReadProject, getProjectFromDb })

  const id = '1234567890abcdef'
  const next = jest.fn()
  const req = {
    session: { user: { _id: 'me' } },
    params: { id },
    body: {
      terms: ['termoneid', 'termtwoid']
    }
  }

  const res = {
    status: jest.fn(() => res),
    send: jest.fn()
  }


  const project = {}
  const categories = [{
    _id: new ObjectID('categoryoneid'),
    terms: [{
      _id: new ObjectID('termoneid'),
      projects: []
    }]
  }, {
    _id: new ObjectID('categorytwoid'),
    terms: [{
      _id: new ObjectID('termtwoid'),
      projects: []
    }, {
      _id: new ObjectID('termthreeid'),
      projects: []
    }]
  }]

  getDb.setResult('findOne', project)
  getDb.setResult('find', categories)

  it('Should check that the project exists', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    getDb.setResult('find', categories) // resetting getDb's lastResult
    await addTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('project')])
    getDb.setResult('findOne', project)
    getDb.setResult('find', categories)
  })

  it("Should return 401 if the user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await addTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.stringContaining('project')])
    userCanReadProjectResult = true
  })

  it('Should check that the terms exist', async () => {
    res.status.mockClear()
    res.send.mockClear()
    req.body.terms[1] = 'termfourid'
    await addTerms(req, res, next)
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'body',
        param: `terms[1]`,
        value: 'termfourid',
        msg: 'term not found'
      }]
    })
    req.body.terms[1] = 'termtwoid'
  })

  it('Should not duplicate projects assigned to terms', async () => {
    categories[0].terms[0].projects = []
    categories[1].terms[0].projects = [new ObjectID(id)]
    await addTerms(req, res, next)
    expect(categories[0].terms[0].projects.length).toBe(1)
    expect(categories[1].terms[0].projects.length).toBe(1)
  })

  it('Should override multiple terms if allowsMultipleTerms is false', async () => {
    getDb.functions.updateOne.mockClear()
    const originalTerms = req.body.terms
    categories[1].terms[0].projects = [new ObjectID(id)]
    categories[1].terms[1].projects = []
    req.body.terms = [categories[1].terms[1]._id.toString()]
    await addTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenNthCalledWith(1, expect.anything(), {
      $set: {
        terms: [{
          _id: categories[1].terms[0]._id,
          projects: []
        }, {
          _id: categories[1].terms[1]._id,
          projects: [new ObjectID(id)]
        }]
      }
    })
    req.body.terms = originalTerms
  })

  it('Should return the updated project', async () => {
    next.mockClear()
    res.send.mockClear()
    await addTerms(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })

  it('Should update the last update Date', async () => {
    getDb.functions.updateOne.mockClear()
    await addTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(expect.any(Object), {
      $set: expect.objectContaining({
        lastUpdateDate: expect.any(Date)
      })
    })
  })
})
