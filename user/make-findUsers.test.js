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
  const res = { status: jest.fn(() => res), send: jest.fn() }

  it('Should check that a query is provided', async () => {
    req.query = {}
    await findUsers(req, res, next)
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'query',
        param: 'q',
        value: req.query.q,
        msg: 'query is empty'
      }]
    })
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
      expect.anything(), expect.anything(), expect.anything(),
      expect.objectContaining({
        projection: { email: 0, password: 0, registrationDate: 0, lastLoginDate: 0 }
      })
    )
  })
})
