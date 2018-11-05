const makeGetUsers = require('./make-getUsers')
const getDb = require('../misc/test-getDb')

describe('getUsers', () => {
  getDb.setResult('find', true)
  const cursorify = jest.fn((req, res, collection, options) => options)
  const sensitiveInformationProjection = { test: true }
  const createFindFilters = jest.fn(() => ({ toArray: () => findResult }))
  const getUsers = makeGetUsers({
    getDb, cursorify, createFindFilters, sensitiveInformationProjection
  })
  const req = { query: {} }
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

  it('Should search by user name', async () => {
    const name = 'nameQuery'
    req.query = { name }
    await getUsers(req, res)
    expect(createFindFilters).toHaveBeenLastCalledWith({ name })
    req.query = {}
  })

  it('Should search by user jobRole', async () => {
    const jobRole = 'jobRoleQuery'
    req.query = { jobRole }
    await getUsers(req, res)
    expect(createFindFilters).toHaveBeenLastCalledWith({ jobRole })
  })
})
