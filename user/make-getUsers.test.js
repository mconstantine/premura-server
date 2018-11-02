const makeGetUsers = require('./make-getUsers')
const getDb = require('../misc/test-getDb')

describe('getUsers', () => {
  getDb.setResult('find', true)
  const cursorify = jest.fn((req, res, collection, options) => options)
  const sensitiveInformationProjection = { test: true }
  const getUsers = makeGetUsers({ getDb, cursorify, sensitiveInformationProjection })
  const req = null
  const res = { send: jest.fn() }

  it('Should work', async () => {
    await(getUsers(req, res))
    expect(getDb.functions.find).toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(getDb.getResult('find'))
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await(getUsers(req, res))
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should not return sensitive information', async () => {
    await(getUsers(req, res))

    expect(getDb.functions.find).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ projection: sensitiveInformationProjection })
    )
  })
})
