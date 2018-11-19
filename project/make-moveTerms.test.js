const makeMoveTerms = require('./make-moveTerms')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('moveTerms', () => {
  let userCanReadProjectResult = () => true
  const getProjectFromDbResult = { test: true }
  const createError = (httpCode, message) => [httpCode, message]
  const userCanReadProject = (...args) => userCanReadProjectResult(...args)
  const getProjectFromDb = jest.fn(() => getProjectFromDbResult)
  const moveTerms = makeMoveTerms({ getDb, ObjectID, createError, userCanReadProject, getProjectFromDb })

  const id = '1234567890abcdef'
  const destination = 'destinationprojectid'
  const next = jest.fn()
  const req = {
    session: { user: { _id: 'me' } },
    params: { id },
    body: { destination }
  }

  const res = {
    status: jest.fn(() => res),
    send: jest.fn()
  }

  const findOneResult = ({ _id }) => ({ _id })
  getDb.setResult('findOne', findOneResult)

  const getCategories = () => [{
    _id: new ObjectID('categoryoneid'),
    terms: [{
      _id: new ObjectID('termoneid'),
      projects: [new ObjectID(id), new ObjectID('somethingelse')]
    }]
  }, {
    _id: new ObjectID('categorytwoid'),
    terms: [{
      _id: new ObjectID('termtwoid'),
      projects: [new ObjectID(id)]
    }]
  }]
  getDb.setResult('find', getCategories)

  it('Should check that the project exists', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    getDb.setResult('find', getCategories)
    await moveTerms(req, res, next)
    expect(next).toHaveBeenCalledWith([404, expect.stringContaining('project')])
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    getDb.setResult('findOne', findOneResult)
    getDb.setResult('find', getCategories)
  })

  it("Should return 401 if the user can't read the project", async () => {
    next.mockClear()
    userCanReadProjectResult = (user, { _id }) => !_id.equals(new ObjectID(id))
    await moveTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.stringContaining('project')])
    userCanReadProjectResult = () => true
  })

  it('Should check that the destination project exists', async () => {
    next.mockClear()
    getDb.functions.findOne.mockClear()
    getDb.setResult('findOne', ({ _id }) => _id.equals(new ObjectID(destination)) ? false : ({ _id }))
    getDb.setResult('find', getCategories)

    await moveTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('destination')])
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: new ObjectID(destination) })
    getDb.setResult('findOne', findOneResult)
    getDb.setResult('find', getCategories)
  })

  it("Should return 401 if the user can't read the destination project", async () => {
    next.mockClear()
    userCanReadProjectResult = (user, { _id }) => !_id.equals(new ObjectID(destination))
    await moveTerms(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.stringContaining('destination')])
    userCanReadProjectResult = () => true
  })

  it('Should work', async () => {
    const categories = getCategories()
    getDb.functions.updateOne.mockClear()
    await moveTerms(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenCalledWith({
      _id: categories[0]._id
    }, {
      $set: {
        terms: [{
          _id: categories[0].terms[0]._id,
          projects: [new ObjectID(destination), categories[0].terms[0].projects[1]]
        }]
      }
    })

    expect(getDb.functions.updateOne).toHaveBeenCalledWith({
      _id: categories[1]._id
    }, {
      $set: {
        terms: [{
          _id: categories[1].terms[0]._id,
          projects: [new ObjectID(destination)]
        }]
      }
    })
  })
})
