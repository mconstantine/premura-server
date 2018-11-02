const makeGetCategory = require('./make-getCategory')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('getCategory', () => {
  const createError = (code, message) => [code, message]
  const req = { params: { id: '1234567890abcdef' } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()
  const getCategory = makeGetCategory({ getDb, ObjectID, createError })

  it('Should reject invalid category ID', async () => {
    res.send.mockClear()
    getDb.functions.findOne.mockClear()
    const originalId = req.params.id
    req.params.id = ''
    await getCategory(req, res, next)
    expect(getDb.functions.findOne).not.toHaveBeenCalled()
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

  it('Should work', async () => {
    next.mockClear()
    getDb.setResult('findOne', { name: 'category name' })
    await getCategory(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.send).toHaveBeenCalledWith(getDb.getResult('findOne'))
  })
})
