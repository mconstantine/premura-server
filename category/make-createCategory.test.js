const makeCreateCategory = require('./make-createCategory')

describe('createCategory', () => {
  let findOneResult
  const _id = '1234567890abcdef'
  const insertOne = jest.fn(() => ({ insertedId: _id }))
  const findOne = jest.fn(() => findOneResult)
  const collection = () => ({ insertOne, findOne })
  const getDb = () => ({ collection })
  const createError = (code, message) => [code, message]
  const createCategory = makeCreateCategory({ getDb, createError })
  const req = {}
  const res = { status: jest.fn(() => res), send: jest.fn(() => res) }
  const next = jest.fn()

  it('Should not allow two categories with the same name', async () => {
    insertOne.mockClear()
    const name = 'name'
    const allowsMultipleTerms = true
    findOneResult = ({ name })
    req.body = { name, allowsMultipleTerms }
    await createCategory(req, res, next)
    expect(insertOne).not.toHaveBeenCalled()
    expect(findOne).toHaveBeenLastCalledWith({ name })
    expect(next).toHaveBeenCalledWith([409, JSON.stringify(findOneResult)])
    findOneResult = false
  })

  it('Should save description if available', async () => {
    const name = 'name'
    const description = 'description'
    const allowsMultipleTerms = true

    req.body = { name, description, allowsMultipleTerms }
    await createCategory(req, res, next)
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
    await createCategory(req, res, next)
    expect(insertOne).toHaveBeenLastCalledWith(expect.not.objectContaining({ invalidProperty }))
  })

  it('Should return the category id', async () => {
    res.send.mockClear()

    const name = 'name'
    const description = 'description'
    const allowsMultipleTerms = true

    req.body = { name, description, allowsMultipleTerms }
    await createCategory(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith({ _id })
  })

  it('Should create an empty terms array', async () => {
    const name = 'name'
    const allowsMultipleTerms = true

    req.body = { name, allowsMultipleTerms }
    await createCategory(req, res, next)
    expect(insertOne).toHaveBeenLastCalledWith(expect.objectContaining({ terms: [] }))
  })
})
