const makeDeleteCategory = require('./make-deleteCategory')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('deleteCategory', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const req = { params: { id: '1234567890abcdef' } }
  const res = { status: jest.fn(() => res), send: jest.fn(), end: jest.fn() }
  const next = jest.fn()
  const deleteCategory = makeDeleteCategory({ getDb, ObjectID, createError })

  it('Should reject invalid category ID', async () => {
    res.end.mockClear()
    const originalId = req.params.id
    req.params.id = ''
    await deleteCategory(req, res, next)
    expect(res.end).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid category id'
      }]
    })
    req.params.id = originalId
  })

  it('Should check that the category exists', async () => {
    next.mockClear()
    getDb.setResult('findOne', false)
    await deleteCategory(req, res, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
  })

  it('Should work', async () => {
    next.mockClear()
    res.send.mockClear()
    res.end.mockClear()
    getDb.functions.deleteOne.mockClear()
    getDb.setResult('findOne', { name: 'category name' })
    await deleteCategory(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalled()
    expect(getDb.functions.deleteOne).toHaveBeenCalled()
  })
})
