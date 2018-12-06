const makeUpdateTerms = require('./make-updateTerms')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')
const util = require('util')

describe('updateTerms', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const genTerms = () => [{
    _id: 'termoneid',
    name: 'Term one'
  }, {
    _id: 'termtwoid',
    name: 'Term two'
  }]

  const req = {
    params: { id: '1234567890abcdef' },
    body: { terms: genTerms() }
  }

  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()
  const updateTerms = makeUpdateTerms({ getDb, ObjectID, createError, gt, util })

  it('Should ensure that the category exists', async () => {
    res.send.mockClear()
    const originalId = req.params.id
    req.params.id = ''
    await updateTerms(req, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith([404, expect.any(String)])
    req.params.id = originalId
  })

  it('Should that the terms exist', async () => {
    res.send.mockClear()
    getDb.setResult('findOne', {
      terms: [{
        _id: 'nonexistingid',
        name: 'I am not one of the updated terms'
      }]
    })

    await updateTerms(req, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'body',
        param: 'terms[0]',
        value: 'termoneid',
        msg: expect.any(String)
      }, {
        location: 'body',
        param: 'terms[1]',
        value: 'termtwoid',
        msg: expect.any(String)
      }]
    })
  })

  it('Should not save any extra information', async () => {
    const terms = genTerms()
    const extra = 'I shall not be saved'
    terms[0].name = 'Old term one'
    terms[1].name = 'Old term two'
    getDb.setResult('findOne', { terms })
    req.body.terms[0].extra = extra
    await updateTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledWith(expect.any(Object), {
      $set: expect.objectContaining({
        terms: [
          expect.not.objectContaining({ extra }),
          expect.any(Object)
        ]
      })
    })

    delete req.body.terms[0].extra
  })

  it('Should return the updated category', async () => {
    const terms = genTerms()
    terms[0].name = 'Old term one'
    terms[1].name = 'Old term two'
    getDb.setResult('findOne', { terms })
    await updateTerms(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenCalledWith(expect.any(Object), {
      $set: expect.objectContaining({ terms: genTerms() })
    })
  })

  it('Should update the last update date', async () => {
    getDb.functions.updateOne.mockClear()
    await updateTerms(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledWith(expect.any(Object), {
      $set: expect.objectContaining({ lastUpdateDate: expect.any(Date) })
    })
  })
})
