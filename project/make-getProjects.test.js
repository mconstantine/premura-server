const makeGetProjects = require('./make-getProjects')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('getProjects', () => {
  const cursorify = jest.fn((req, res, query) => query)
  const createFindFilters = jest.fn(x => x)
  const getProjects = makeGetProjects({ getDb, ObjectID, cursorify, createFindFilters })
  const req = { session: { user: { _id: 'me' } }, query: {} }
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
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $and: [expect.any(Object), { name }]
      }
    }]))
  })

  it('Should search by status', async () => {
    const status = 'status'
    req.query = { status }
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $and: [expect.any(Object), { status }]
      }
    }]))
  })

  it('Should search by people', async () => {
    const people = ['apersonidone', 'apersonidtwo']
    req.query = { people }
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $and: [
          expect.any(Object), {
          'people._id': {
            $in: [new ObjectID('apersonidone'), new ObjectID('apersonidtwo')]
          }
        }]
      }
    }]))
  })

  it('Should search by deadline before', async () => {
    const before = new Date().toISOString()
    req.query = { before }
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $and: [
          expect.any(Object), {
            deadlines: { $lte: new Date(before) }
          }
        ]
      }
    }]))
  })

  it('Should search by deadline after', async () => {
    const after = new Date().toISOString()
    req.query = { after }
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $and: [
          expect.any(Object), {
            deadlines: { $gte: new Date(after) }
          }
        ]
      }
    }]))
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await getProjects(req, res)
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should only show projects where the current user is assigned', async () => {
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $and: [
          { 'people._id': { $all: [new ObjectID(req.session.user._id)] } },
          expect.any(Object)
        ]
      }
    }]))
  })

  it('Should search by categories (OR)', async () => {
    const categories = ['categoryoneid', 'categorytwoid']
    req.query = { categories }
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'terms.projects',
          as: 'categories'
        }
      }, {
        $match: {
          'categories._id': { $in: categories.map(_id => new ObjectID(_id)) }
        }
    }]))
  })

  it('Should search by terms (OR)', async () => {
    const terms = ['termoneid', 'termtwoid']
    req.query = { terms }
    await getProjects(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'terms.projects',
          as: 'categories'
        }
      }, {
        $match: {
          'categories.terms._id': { $in: terms.map(_id => new ObjectID(_id)) }
        }
    }]))
  })
})
