const makeGetActivities = require('./make-getActivities')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('getActivities', () => {
  const cursorify = jest.fn((req, res, query) => query)
  const createFindFilters = jest.fn(x => x)
  const getActivities = makeGetActivities({ getDb, ObjectID, cursorify, createFindFilters })
  const req = { session: { user: { _id: 'me' } }, query: {} }
  const res = { send: jest.fn() }

  it('Should work', async () => {
    getDb.setResult('find', [{ test: true }, { working: true }])
    await getActivities(req, res)
    expect(res.send).toHaveBeenLastCalledWith(getDb.getResult('find'))
  })

  it('Should search by title', async () => {
    const title = 'A title'
    req.query = { title }
    await getActivities(req, res)
    expect(createFindFilters).toHaveBeenLastCalledWith({ title })
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: { title }
    }]))
  })

  it('Should search by project', async () => {
    const project = 'aprojectid'
    req.query = { project }
    await getActivities(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        project: new ObjectID(project)
      }
    }]))
  })

  it('Should search by recipient', async () => {
    const recipient = 'arecipientid'
    req.query = { recipient }
    await getActivities(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        recipient: new ObjectID(recipient)
      }
    }]))
  })

  it('Should search by people and recipient correctly', async () => {
    const recipient = 'arecipientid'
    const people = ['apersonidone', 'apersonidtwo']
    req.query = { people, recipient }
    await getActivities(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        $or: [{
          recipient: {
            $in: people.map(_id => new ObjectID(_id)).concat([new ObjectID(recipient)])
          }
        }, {
          people: {
            $in: people.map(_id => new ObjectID(_id))
          }
        }]
      }
    }]))
  })

  it('Should search by time before', async () => {
    const before = new Date().toISOString()
    req.query = { before }
    await getActivities(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        timeTo: { $lte: new Date(before) }
      }
    }]))
  })

  it('Should search by time after', async () => {
    const after = new Date().toISOString()
    req.query = { after }
    await getActivities(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $match: {
        timeFrom: { $gte: new Date(after) }
      }
    }]))
  })

  it('Should allow pagination', async () => {
    cursorify.mockClear()
    await getActivities(req, res)
    expect(cursorify).toHaveBeenCalled()
  })

  it('Should only show projects where the current user is assigned', async () => {
    await getActivities(req, res)
    expect(getDb.functions.aggregate).toHaveBeenLastCalledWith(expect.arrayContaining([{
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'extendedProject'
      }
    }, {
      $match: {
        'extendedProject.people._id': req.session.user._id
      }
    }]))
  })
})
