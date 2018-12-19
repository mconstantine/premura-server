const makeGetMessages = require('./make-getMessages')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('getMessages', () => {
  const cursorify = jest.fn((req, res, query) => query)
  const createFindFilters = jest.fn(x => x)
  const getMessages = makeGetMessages({ getDb, ObjectID, cursorify, createFindFilters })

  const req = {
    params: { id: 'someprojectid' },
    query: {}
  }

  const res = { send: jest.fn() }

  it('Should filter by project id', async () => {
    await getMessages(req, res)

    expect(getDb.functions.find).toHaveBeenCalledWith({
      project: new ObjectID(req.params.id)
    })
  })

  it('Should paginate messages', async () => {
    await getMessages(req, res)
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should search in messages content', async () => {
    const queryString = 'Some query'
    req.query.content = queryString
    createFindFilters.mockClear()

    await getMessages(req, res)

    expect(createFindFilters).toHaveBeenCalled()
    expect(getDb.functions.find).toHaveBeenCalledWith({
      $and: [
        { project: new ObjectID(req.params.id) },
        { content: queryString }
      ]
    })

    req.query = {}
  })
})
