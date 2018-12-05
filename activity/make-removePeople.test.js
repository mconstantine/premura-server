const makeRemovePeople = require('./make-removePeople')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('removePeople', () => {
  const getMasterUser = () => ({
    _id: new ObjectID('masteruser'),
    role: 'master'
  })

  const getMakerUser = () => ({
    _id: new ObjectID('makeruser'),
    role: 'maker'
  })

  const createError = (httpCode, message) => [httpCode, message]
  const userCanReadProject = jest.fn(() => true)
  const getActivityFromDb = jest.fn()

  let getActivity = () => ({
    _id: new ObjectID('activityid'),
    recipient: getMasterUser()._id,
    people: []
  })

  const getProject = () => ({
    _id: new ObjectID('projectid')
  })

  const findOne = (...args) => {
    switch (getDb.getCurrentCollection()) {
      case 'projects':
        return getProject(...args)
      case 'activities':
        return getActivity(...args)
      default:
        return false
    }
  }

  getDb.setResult('findOne', findOne)

  const removePeople = makeRemovePeople({
    getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
  })

  const req = {
    session: { user: getMasterUser() },
    params: { id: getActivity()._id.toString() },
    body: {
      people: []
    }
  }

  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  it('Should check that activity exists', async () => {
    getDb.functions.findOne.mockClear()
    await removePeople(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: getActivity()._id })
  })

  it('Should check that currentUser can access the project', async () => {
    userCanReadProject.mockClear()
    await removePeople(req, res, next)
    expect(userCanReadProject).toHaveBeenCalledWith(req.session.user, getProject())
  })

  it("Should not allow a maker to edit another user's activity", async () => {
    next.mockClear()
    req.session.user = getMakerUser()

    await removePeople(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])

    req.session.user = getMasterUser()
  })

  it('Should allow a maker to edit its own activity', async () => {
    next.mockClear()
    req.session.user = getMakerUser()

    const originalGetActivity = getActivity

    getActivity = () => Object.assign(originalGetActivity(), {
      recipient: getMakerUser()._id
    })

    await removePeople(req, res, next)
    expect(next).not.toHaveBeenCalled()

    getActivity = originalGetActivity
    req.session.user = getMasterUser()
  })

  it("Should allow a manager to edit another user's activity", async () => {
    const originalGetActivity = getActivity

    getActivity = () => Object.assign(originalGetActivity(), {
      recipient: getMakerUser()._id
    })

    await removePeople(req, res, next)
    expect(next).not.toHaveBeenCalled()

    getActivity = originalGetActivity
  })

  it('Should work', async () => {
    await removePeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledWith({
      _id: getActivity()._id
    }, {
      $set: expect.objectContaining({
        people: []
      })
    })
  })

  it('Should update lastUpdateDate', async () => {
    await removePeople(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenCalledWith({
      _id: getActivity()._id
    }, {
      $set: expect.objectContaining({
        lastUpdateDate: expect.any(Date)
      })
    })
  })
})
