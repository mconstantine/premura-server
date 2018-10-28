const ejson = require('ejson')
const base64Url = require('base64-url')
const cursorify = require('./cursorify')

const createCursor = (limit, skip) => base64Url.encode(ejson.stringify({ limit, skip }))

describe('cursorify', () => {
  let headers = {}, documentsCount = 100
  const req = { get: key => headers[key], query: {} }
  const res = { setHeader: jest.fn() }
  const collection = { countDocuments: () => documentsCount }

  it('Should be optional', async () => {
    headers = {}
    req.query = {}
    res.setHeader.mockClear()

    const result = await cursorify(req, null, null)

    expect(result).not.toHaveProperty('limit')
    expect(result).not.toHaveProperty('skip')
    expect(res.setHeader).not.toHaveBeenCalled()
  })

  it('Should get options from request', async () => {
    req.query = {
      page: 2,
      perPage: 5
    }

    const result = await cursorify(req, res, collection)
    expect(result).toMatchObject({ limit: 5, skip: 5 })

    req.query = {}
  })

  it('Should get options from cursor', async () => {
    req.query = {}

    const cursor = createCursor(5, 5)
    headers = { 'X-Page-Cursor': cursor }

    const result = await cursorify(req, res, collection)
    expect(result).toMatchObject({ limit: 5, skip: 5 })

    headers = {}
  })

  it('Should prefer cursor options over request ones', async () => {
    req.query = {
      page: 2,
      perPage: 5
    }

    const cursor = createCursor(10, 10)
    headers = { 'X-Page-Cursor': cursor }

    const result = await cursorify(req, res, collection)
    expect(result).toMatchObject({ limit: 10, skip: 10 })

    req.query = {}
    headers = {}
  })

  it('Should return default options if cursor is not parsable', async () => {
    console.error = () => {} // This test triggers console.error
    req.query = {}

    const cursor = 'invalid stuff'
    headers = { 'X-Page-Cursor': cursor }

    const defaultOptions = { answer: 42 }
    const result = await cursorify(req, res, null, defaultOptions)
    expect(result).toEqual(defaultOptions)

    headers = {}
  })

  it('Should create a correct prev page cursor', async () => {
    res.setHeader.mockClear()
    req.query = { page: 1 }

    await cursorify(req, res, collection)
    expect(res.setHeader).not.toHaveBeenCalledWith('X-Prev-Page-Cursor', expect.anything())

    req.query = { page: 2 }

    await cursorify(req, res, collection)
    expect(res.setHeader).toHaveBeenCalledWith('X-Prev-Page-Cursor', expect.anything())

    const prevPageCursor = res.setHeader.mock.calls.find(([key]) => key === 'X-Prev-Page-Cursor')
    const prevPageCursorValue = ejson.parse(base64Url.decode(prevPageCursor[1]))

    expect(prevPageCursorValue).toMatchObject({ skip: 0 })

    req.query = {}
  })

  it('Should create a correct next page cursor', async () => {
    res.setHeader.mockClear()
    documentsCount = 10
    req.query = { page: 2, perPage: 5 }

    await cursorify(req, res, collection)
    expect(res.setHeader).not.toHaveBeenCalledWith('X-Next-Page-Cursor', expect.anything())

    req.query = { page: 1, perPage: 5 }

    await cursorify(req, res, collection)
    expect(res.setHeader).toHaveBeenCalledWith('X-Next-Page-Cursor', expect.anything())

    const nextPageCursor = res.setHeader.mock.calls.find(([key]) => key === 'X-Next-Page-Cursor')
    const nextPageCursorValue = ejson.parse(base64Url.decode(nextPageCursor[1]))

    expect(nextPageCursorValue).toMatchObject({ skip: 5 })

    req.query = {}
  })

  it('Should put the pages count and current page into the headers', async () => {
    res.setHeader.mockClear()
    documentsCount = 6
    req.query = { page: 2, perPage: 5 }

    await cursorify(req, res, collection)

    expect(res.setHeader).toHaveBeenCalledWith('X-Pages-Count', 2)
    expect(res.setHeader).toHaveBeenCalledWith('X-Current-Page', 2)
  })
})
