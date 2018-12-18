const makeRemoveTerms = require('./make-removeTerms')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('removeTerms', () => {
  let userCanReadProjectResult = true
  const getProjectFromDbResult = { test: true }
  const createError = (httpCode, message) => [httpCode, message]
  const userCanReadProject = () => userCanReadProjectResult
  const getProjectFromDb = jest.fn(() => getProjectFromDbResult)
  const removeTerms = makeRemoveTerms({
    getDb, ObjectID, createError, userCanReadProject, getProjectFromDb, gt
  })

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


  const project = {
    _id: new ObjectID(id)
  }

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
    }]
  }]

  getDb.setResult('findOne', project)

  it('Should check that the project exists', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    getDb.setResult('find', categories) // resetting getDb's lastResult
    await removeTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getDb.setResult('findOne', project)
    getDb.setResult('find', categories)
  })

  it("Should return 401 if the user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await removeTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it('Should work', async () => {
    getDb.functions.updateOne.mockClear()
    categories[0].terms[0].projects = [new ObjectID(id)]
    categories[1].terms[0].projects = [new ObjectID(id)]
    getDb.setResult('find', categories)
    await removeTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledTimes(2)

    expect(getDb.functions.updateOne).toHaveBeenCalledWith({
      _id: new ObjectID('categoryoneid')
    }, {
      $set: expect.objectContaining({
        terms: [{
          _id: new ObjectID('termoneid'),
          projects: []
        }]
      })
    })

    expect(getDb.functions.updateOne).toHaveBeenCalledWith({
      _id: new ObjectID('categorytwoid')
    }, {
      $set: expect.objectContaining({
        terms: [{
          _id: new ObjectID('termtwoid'),
          projects: []
        }]
      })
    })
  })

  it('Should return the updated project', async () => {
    next.mockClear()
    res.send.mockClear()
    await removeTerms(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(getProjectFromDbResult)
  })

  it('Should update the last update date', async () => {
    getDb.functions.updateOne.mockClear()
    await removeTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledWith(expect.any(Object), {
      $set: expect.objectContaining({ lastUpdateDate: expect.any(Date) })
    })
  })
})
