const makeGetUsers = require('./make-getUsers')

describe('getUsers', () => {
  let Collection
  const findResult = true
  const toArray = () => findResult
  const find = jest.fn(() => Collection)
  Collection = { find, toArray }
  const collection = () => Collection
  const getDb = () => ({ collection })
  const cursorify = jest.fn((req, res, collection, options) => options)
  const getUsers = makeGetUsers({ getDb, cursorify })
  const req = null
  const res = { send: jest.fn() }

  it('Should work', async () => {
    await(getUsers(req, res))
    expect(find).toHaveBeenCalled()
    expect(res.send).toHaveBeenLastCalledWith(findResult)
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await(getUsers(req, res))
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should not return passwords', async () => {
    await(getUsers(req, res))

    expect(find).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ projection: { password: 0 } })
    )
  })
})
