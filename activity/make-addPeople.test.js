const makeAddPeople = require('./make-addPeople')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('addPeople', () => {
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

  const getProject = () => ({
    _id: new ObjectID('projectid')
  })

  const getUser = ({ _id }) => {
    const masterUser = getMasterUser()
    const makerUser = getMakerUser()
    return _id.equals(masterUser._id) ? masterUser : makerUser
  }

  let getActivity = () => ({
    _id: new ObjectID('activityid'),
    recipient: getMasterUser()._id,
    people: []
  })

  const findOne = (...args) => {
    switch (getDb.getCurrentCollection()) {
      case 'projects':
        return getProject(...args)
      case 'users':
        return getUser(...args)
      case 'activities':
        return getActivity(...args)
      default:
        return false
    }
  }

  getDb.setResult('findOne', findOne)

  const addPeople = makeAddPeople({
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
    await addPeople(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: getActivity()._id })
  })

  it("Should not allow a maker to edit another user's activity", async () => {
    next.mockClear()
    req.session.user = getMakerUser()

    await addPeople(req, res, next)
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

    await addPeople(req, res, next)
    expect(next).not.toHaveBeenCalled()

    getActivity = originalGetActivity
    req.session.user = getMasterUser()
  })

  it("Should allow a manager to edit another user's activity", async () => {
    const originalGetActivity = getActivity

    getActivity = () => Object.assign(originalGetActivity(), {
      recipient: getMakerUser()._id
    })

    await addPeople(req, res, next)
    expect(next).not.toHaveBeenCalled()

    getActivity = originalGetActivity
  })

  it('Should not add the recipient to people', async () => {
    getDb.functions.updateOne.mockClear()
    getActivityFromDb.mockClear()
    req.body.people = [getMasterUser()._id.toString()]
    await addPeople(req, res, next)
    expect(getDb.functions.updateOne).not.toHaveBeenCalled()
    expect(getActivityFromDb).toHaveBeenCalled()
  })

  it('Should remove duplicates from the request', async () => {
    req.body.people = [
      getMakerUser()._id.toString(),
      getMakerUser()._id.toString(),
      getMakerUser()._id.toString()
    ]

    await addPeople(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: getActivity()._id
    }, {
      $set: { people: [getMakerUser()._id] }
    })
  })

  it('Should not save the same person twice', async () => {
    getDb.functions.updateOne.mockClear()
    getActivityFromDb.mockClear()
    originalGetActivity = getActivity

    getActivity = () => Object.assign(originalGetActivity(), {
      people: [getMakerUser()._id]
    })

    req.body.people = [getMakerUser()._id.toString()]
    await addPeople(req, res, next)
    expect(getDb.functions.updateOne).not.toHaveBeenCalled()
    expect(getActivityFromDb).toHaveBeenCalled()

    getActivity = originalGetActivity
  })

  it('Should check that people exist', async () => {
    req.body.people = ['onetimeuserid']
    await addPeople(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID('onetimeuserid') })
  })

  it('Should check that people can access the project', async () => {
    userCanReadProject.mockClear()
    req.body.people = [getMakerUser()._id.toString()]
    await addPeople(req, res, next)
    expect(userCanReadProject).toHaveBeenCalledWith(
      getMakerUser(),
      getProject()
    )
  })
})
