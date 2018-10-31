const makeFindUsers = require('./make-findUsers')

describe('findUsers', () => {
  const q = 'query'
  const req = { query: { q } }
  const createError = (code, message) => [code, message]
  const next = jest.fn()
  const collection = () => true
  const getDb = () => ({ collection })
  const queryResult = { test: true }
  const find = jest.fn(() => ({ toArray: () => queryResult }))
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const sensitiveInformationProjection = { test: true }
  const findUsers = makeFindUsers({ createError, getDb, find, sensitiveInformationProjection })

  it('Should check that a query is provided', async () => {
    req.query = {}
    await findUsers(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith([])
  })

  it('Should search by user name', async () => {
    const name = 'nameQuery'
    req.query = { name }
    await findUsers(req, res, next)
    expect(find).toHaveBeenLastCalledWith(expect.anything(), { name }, expect.anything())
    expect(res.send).toHaveBeenLastCalledWith(queryResult)
  })

  it('Should search by user jobRole', async () => {
    const jobRole = 'jobRoleQuery'
    req.query = { jobRole }
    await findUsers(req, res, next)
    expect(find).toHaveBeenLastCalledWith(expect.anything(), { jobRole }, expect.anything())
    expect(res.send).toHaveBeenLastCalledWith(queryResult)
  })

  it('Should return nothing by default', async () => {
    req.query = { invalidField: 'whatever' }
    await findUsers(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith([])
  })

  it('Should hide sensitive user data', async () => {
    req.query = { name: 'whatever' }
    await findUsers(req, res, next)
    expect(find).toHaveBeenLastCalledWith(
      expect.anything(), expect.anything(),
      expect.objectContaining({
        projection: sensitiveInformationProjection
      })
    )
  })
})
