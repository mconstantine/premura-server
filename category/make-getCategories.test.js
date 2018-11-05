const makeGetCategories = require('./make-getCategories')
const getDb = require('../misc/test-getDb')

describe('getCategories', () => {
  const findResult = { test: true }
  const cursorify = jest.fn((req, res, query, options) => options)
  const find = jest.fn(() => ({ toArray: () => findResult }))
  const getCategories = makeGetCategories({ getDb, find, cursorify })
  const req = { query: {} }
  const res = { send: jest.fn() }

  getDb.setResult('find', [{ name: 'category name' }])

  it('Should work', async () => {
    await getCategories(req, res)
    expect(res.send).toHaveBeenCalledWith(getDb.getResult('find'))
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await getCategories(req, res)
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should sort by name', async () => {
    await getCategories(req, res)
    expect(getDb.functions.find).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
      sort: { name: 1 }
    }))
  })

  it.only('Should search by category name', async () => {
    const name = 'nameQuery'
    req.query = { name }
    await getCategories(req, res)
    expect(find).toHaveBeenLastCalledWith({ name })
    req.query = {}
  })
})
