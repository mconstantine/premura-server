const makeFindCategories = require('./make-findCategories')
const getDb = require('../misc/test-getDb')

describe('findCategories', () => {
  const req = {}
  const next = jest.fn()
  const res = { send: jest.fn() }
  const findResult = { test: true }
  const find = jest.fn(() => ({ toArray: () => findResult }))
  const findCategories = makeFindCategories({ getDb, find })

  it('Should check that a query is provided', async () => {
    req.query = {}
    await findCategories(req, res)
    expect(res.send).toHaveBeenLastCalledWith([])
  })

  it('Should search by category name', async () => {
    const name = 'nameQuery'
    req.query = { name }
    await findCategories(req, res)
    expect(find).toHaveBeenLastCalledWith(expect.anything(), { name })
    expect(res.send).toHaveBeenLastCalledWith(findResult)
  })

  it('Should return nothing by default', async () => {
    req.query = { invalidField: 'whatever' }
    await findCategories(req, res)
    expect(res.send).toHaveBeenLastCalledWith([])
  })
})
