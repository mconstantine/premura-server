const getDb = require('../misc/test-getDb')
const makeGetUser = require('./make-getUser')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('getUser', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const sensitiveInformationProjection = { test: true }

  const id = '1234567890abcdef'
  const req = { params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  const getUser = makeGetUser({ getDb, createError, ObjectID, sensitiveInformationProjection, gt })

  it('Should check that an ID is provided', async () => {
    req.params = {}

    await getUser(req, res, next)
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

  it("Should fail if the user doesn't exist", async () => {
    getDb.setResult('findOne', false)
    await getUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    getDb.setResult('findOne', true)
  })

  it('Should work', async () => {
    getDb.setResult('findOne', true)
    await getUser(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(getDb.getResult('findOne'))
  })

  it('Should hide sensitive information', async () => {
    await getUser(req, res, next)

    expect(getDb.functions.findOne).toHaveBeenLastCalledWith(expect.anything(), {
      projection: sensitiveInformationProjection
    })
  })
})
