const makeGetCategories = require('./make-getCategories')
const getDb = require('../misc/test-getDb')

describe('getCategories', () => {
  const cursorify = jest.fn((req, res, query, options) => options)
  const getCategories = makeGetCategories({ getDb, cursorify })
  const res = { send: jest.fn() }

  getDb.setResult('find', [{ name: 'category name' }])

  it('Should work', async () => {
    await getCategories(null, res)
    expect(res.send).toHaveBeenCalledWith(getDb.getResult('find'))
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await getCategories(null, res)
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should sort by name', async () => {
    await getCategories(null, res)
    expect(getDb.functions.find).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
      sort: { name: 1 }
    }))
  })
})
