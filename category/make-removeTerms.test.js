const makeRemoveTerms = require('./make-removeTerms')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('removeTerms', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const removeTerms = makeRemoveTerms({ getDb, ObjectID, createError })
  const params = { id: '1234567890abcdef' }

  const category = {
    _id: new ObjectID(params.id),
    terms: [{ _id: new ObjectID('1') }, { _id: new ObjectID('2') }, { _id: new ObjectID('3') }]
  }

  const body = { terms: [
    { _id: category.terms[0]._id.toString() },
    { _id: category.terms[1]._id.toString() }
  ]}

  const req = { params, body }
  const res = { send: jest.fn() }
  const next = jest.fn()

  getDb.setResult('findOne', category)

  it('Should work', async () => {
    await removeTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({ _id: category._id }, {
      $set: { terms: [expect.objectContaining(category.terms[2])] }
    })
  })

  it('Should return the updated category', async () => {
    next.mockClear()
    res.send.mockClear()
    await removeTerms(req, res, next)
    expect(next).not.toHaveBeenCalled()
    const result = JSON.parse(JSON.stringify(category))
    result.terms = [category.terms[2]]
    expect(res.send).toHaveBeenLastCalledWith(result)
  })

  it('Should check that the category exists', async () => {
    getDb.setResult('findOne', false)
    res.send.mockClear()
    await removeTerms(req, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('category')])
    getDb.setResult('findOne', category)
  })

  it('Should check that the terms exist', async () => {
    res.send.mockClear()
    req.body.terms[1]._id = '5'
    await removeTerms(req, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenLastCalledWith([404, expect.stringContaining('term')])
    req.body.terms[1]._id = '2'
  })
})
