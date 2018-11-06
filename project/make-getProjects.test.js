const makeGetProjects = require('./make-getProjects')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('getProjects', () => {
  const cursorifyResult = { cursorify: true }
  const cursorify = jest.fn((req, res, query) => cursorifyResult)
  const createFindFilters = jest.fn(x => x)
  const getProjects = makeGetProjects({ getDb, ObjectID, cursorify, createFindFilters })
  const req = { query: {} }
  const res = { send: jest.fn() }

  it('Should work', async () => {
    getDb.setResult('find', [{ test: true }, { working: true }])
    await getProjects(req, res)
    expect(res.send).toHaveBeenLastCalledWith(getDb.getResult('find'))
  })

  it('Should search by name', async () => {
    const name = 'A name'
    req.query = { name }
    await getProjects(req, res)
    expect(createFindFilters).toHaveBeenLastCalledWith({ name })
    expect(getDb.functions.find).toHaveBeenLastCalledWith({ name }, expect.anything())
  })

  it('Should search by status', async () => {
    const status = 'status'
    req.query = { status }
    await getProjects(req, res)
    expect(getDb.functions.find).toHaveBeenLastCalledWith({ status }, expect.anything())
  })

  it('Should search by people', async () => {
    const people = ['apersonidone', 'apersonidtwo']
    req.query = { people }
    await getProjects(req, res)
    expect(getDb.functions.find).toHaveBeenLastCalledWith({
      'people._id': {
        $in: [new ObjectID('apersonidone'), new ObjectID('apersonidtwo')]
      }
    }, expect.anything())
  })

  it('Should search by deadline before', async () => {
    const before = new Date().toISOString()
    req.query = { before }
    await getProjects(req, res)
    expect(getDb.functions.find).toHaveBeenLastCalledWith({
      deadlines: { $lte: new Date(before) }
    }, expect.anything())
  })

  it('Should search by deadline after', async () => {
    const after = new Date().toISOString()
    req.query = { after }
    await getProjects(req, res)
    expect(getDb.functions.find).toHaveBeenLastCalledWith({
      deadlines: { $gte: new Date(after) }
    }, expect.anything())
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await getProjects(req, res)
    expect(cursorify).toHaveBeenCalled()
    expect(getDb.functions.find).toHaveBeenLastCalledWith(expect.anything(), cursorifyResult)
  })
})
