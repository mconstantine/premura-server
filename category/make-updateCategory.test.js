const makeUpdateCategory = require('./make-updateCategory')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('updateCategory', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const category = {
    _id: '1234567890abcdef',
    name: 'category name',
    allowsMultipleTerms: true,
    terms: []
  }

  getDb.setResult('findOne', Object.assign({}, category))
  const updateCategory = makeUpdateCategory({ getDb, ObjectID, createError })
  const next = jest.fn()
  const res = { send: jest.fn() }
  const req = {
    params: { id: '1234567890abdef' },
    body: { name: 'new name', description: 'description', allowsMultipleTerms: false }
  }

  it('Should check that the category exists', async () => {
    getDb.functions.findOne.mockClear()
    await updateCategory(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(req.params.id) })
  })

  it('Should not save any extra information', async () => {
    const extra = 'I shall not be saved'
    req.body.extra = extra
    await updateCategory(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.not.objectContaining({ extra }) }
    )
    delete req.body.extra
  })

  it('Should not override _id', async () => {
    const _id = 'iamanewid'
    req.body._id = _id
    await updateCategory(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.not.objectContaining({ _id }) }
    )
    delete req.body._id
  })

  it('Should return the updated category', async () => {
    await updateCategory(req, res, next)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining(Object.assign(category, req.body)))
  })

  it('Should update the last update date', async () => {
    getDb.functions.updateOne.mockClear()
    await updateCategory(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(
      expect.anything(),
      { $set: expect.objectContaining({ lastUpdateDate: expect.any(Date) }) }
    )
  })
})
