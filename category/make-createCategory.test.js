const makeCreateCategory = require('./make-createCategory')

describe('createCategory', () => {
  const _id = '1234567890abcdef'
  const insertOne = jest.fn(() => ({ insertedId: _id }))
  const collection = () => ({ insertOne })
  const getDb = () => ({ collection })
  const createCategory = makeCreateCategory({ getDb })
  const req = {}
  const res = { status: jest.fn(() => res), send: jest.fn(() => res) }

  it('Should save description if available', async () => {
    const name = 'name'
    const description = 'description'
    const allowsMultipleTerms = true

    req.body = { name, description, allowsMultipleTerms }
    await createCategory(req, res)
    expect(insertOne).toHaveBeenLastCalledWith(expect.objectContaining({ description }))

    req.body = { name, allowsMultipleTerms }
    await createCategory(req, res)
    expect(insertOne).toHaveBeenLastCalledWith(expect.not.objectContaining({ description }))
  })

  it('Should not save invalid properties', async () => {
    const name = 'name'
    const allowsMultipleTerms = true
    const invalidProperty = 'invalidProperty'

    req.body = { name, allowsMultipleTerms, invalidProperty }
    await createCategory(req, res)
    expect(insertOne).toHaveBeenLastCalledWith(expect.not.objectContaining({ invalidProperty }))
  })

  it('Should return the category id', async () => {
    res.send.mockClear()

    const name = 'name'
    const description = 'description'
    const allowsMultipleTerms = true

    req.body = { name, description, allowsMultipleTerms }
    await createCategory(req, res)
    expect(res.send).toHaveBeenLastCalledWith({ _id })
  })
})
