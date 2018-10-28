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
  const findUsers = makeFindUsers({ createError, getDb, find })
  const res = { send: jest.fn() }

  it('Should check that a query is provided', async () => {
    req.query = {}
    await findUsers(req, null, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('query')])
    req.query = { q }
  })

  it('Should search by user name', async () => {
    await findUsers(req, res, next)
    expect(find).toHaveBeenLastCalledWith(expect.anything(), ['name'], q, expect.anything())
    expect(res.send).toHaveBeenLastCalledWith(queryResult)
  })

  it('Should hide sensitive user data', async () => {
    await findUsers(req, res, next)
    expect(find).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ projection: { email: 0, password: 0 } })
    )
  })
})
