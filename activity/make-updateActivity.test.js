const makeUpdateActivity = require('./make-updateActivity')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')

describe('updateActivity', () => {
  let currentUserCanReadProject = true, recipientCanReadProject = true
  const createError = (httpCode, message) => [httpCode, message]

  const getMasterUser = () => ({
    _id: new ObjectID('userone'),
    role: 'master'
  })

  const getMakerUser = () => ({
    _id: new ObjectID('usertwo'),
    role: 'maker'
  })

  let currentUser = getMasterUser()

  const userCanReadProject = jest.fn(user => {
    if (user._id.equals(currentUser._id)) {
      return currentUserCanReadProject
    }

    return recipientCanReadProject
  })

  const getActivityFromDb = jest.fn(() => ({ test: true }))

  const updateActivity = makeUpdateActivity({
    getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
  })

  const req = {
    session: { user: currentUser },
    params: { id: 'activityid' },
    body: {}
  }

  const res = {
    status: jest.fn(() => res),
    send: jest.fn()
  }

  const next = jest.fn()

  let getProject = () => ({
    _id: new ObjectID('projectid'),
    people: [getMasterUser(), getMakerUser()]
  })

  const getUser = ({ _id }) => _id.equals(getMasterUser()._id) ? getMasterUser() : getMakerUser()
  const findOne = (...args) => {
    switch (getDb.getCurrentCollection()) {
      case 'activities':
        return { _id: new ObjectID('activityid') }
      case 'projects':
        return getProject(...args)
      case 'users':
        return getUser(...args)
      default:
        return null
    }
  }

  getDb.setResult('findOne', findOne)

  let activities = []

  const getActivities = () => activities
  getDb.setResult('find', getActivities)

  it('Should check that activity exists', async () => {
    getDb.functions.findOne.mockClear()
    await updateActivity(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({
      _id: new ObjectID(req.params.id)
    })
  })

  it('Should check that project exists', async () => {
    getDb.functions.findOne.mockClear()
    const id = 'aproject'
    req.body.project = id
    await updateActivity(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: new ObjectID(id) })
  })

  it('Should check that user can read project', async () => {
    userCanReadProject.mockClear()
    await updateActivity(req, res, next)
    expect(userCanReadProject).toHaveBeenCalledWith(currentUser, expect.anything())
  })

  it('Should check that recipient exists', async () => {
    const recipient = getMasterUser()._id.toString()
    getDb.functions.findOne.mockClear()
    req.body.recipient = recipient
    await updateActivity(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({
      _id: new ObjectID(recipient)
    })
  })

  it('Should check that recipient can read project', async () => {
    const user = getMakerUser()
    const recipient = user._id.toString()
    req.body.recipient = recipient
    userCanReadProject.mockClear()
    await updateActivity(req, res, next)
    expect(userCanReadProject).toHaveBeenCalledWith(user, expect.anything())
  })

  it('Should not allow a maker to assign activities to other users', async () => {
    res.send.mockClear()
    req.session.user = getMakerUser()
    req.body.recipient = getMasterUser()._id.toString()
    await updateActivity(req, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    req.session.user = getMasterUser()
  })

  it('Should allow a maker to assign activities to itself', async () => {
    next.mockClear()
    req.session.user = getMakerUser()
    req.body.recipient = getMakerUser()._id.toString()
    await updateActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()
    req.session.user = getMasterUser()
  })

  it('Should allow a manager to assign activities to other users', async () => {
    next.mockClear()
    const user = getMasterUser()
    user.role = 'manager'
    req.session.user = user
    req.body.recipient = getMasterUser()._id.toString()
    await updateActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()
    req.session.user = getMasterUser()
  })

  it('Should allow a manager to assign activities to itself', async () => {
    next.mockClear()
    const user = getMasterUser()
    user.role = 'manager'
    req.session.user = user
    req.body.recipient = user._id.toString()
    await updateActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()
    req.session.user = getMasterUser()
  })

  it('Should check that timeFrom comes before timeTo', async () => {
    const now = Date.now()
    next.mockClear()
    req.body = {
      timeFrom: new Date(now + 1000 * 60 * 60 * 24).toISOString(),
      timeTo: new Date(now + 1000 * 60 * 60 * 12).toISOString()
    }
    await updateActivity(req, res, next)
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [expect.objectContaining({
        location: 'body',
        param: 'timeTo',
        value: req.body.timeTo
      })]
    })
  })

  it('Should check for conflicts (before)', async () => {
    next.mockClear()

    const now = Date.now()
    const one = new Date(now)
    const two = new Date(now + 1000 * 60 * 60 * 24)
    const three = new Date(now + 1000 * 60 * 60 * 48)
    const four = new Date(now + 1000 * 60 * 60 * 72)

    activities = [{
      _id: new ObjectID('anotheractivityid'),
      timeFrom: one,
      timeTo: two
    }]

    req.body = {
      timeFrom: three.toISOString(),
      timeTo: four.toISOString()
    }

    await updateActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()
  })

  it('Should check for conflicts (before and meanwhile)', async () => {
    next.mockClear()

    const now = Date.now()
    const one = new Date(now)
    const two = new Date(now + 1000 * 60 * 60 * 24)
    const three = new Date(now + 1000 * 60 * 60 * 48)
    const four = new Date(now + 1000 * 60 * 60 * 72)

    const conflict = {
      _id: new ObjectID('anotheractivityid'),
      timeFrom: one,
      timeTo: three
    }

    activities = [conflict]

    req.body = {
      timeFrom: two.toISOString(),
      timeTo: four.toISOString()
    }

    await updateActivity(req, res, next)

    expect(next).toHaveBeenLastCalledWith([409, expect.objectContaining({
      msg: expect.any(String),
      conflict
    })])
  })

  it('Should exclude current activity while checking for conflicts', async () => {
    next.mockClear()

    const now = Date.now()
    const one = new Date(now)
    const two = new Date(now + 1000 * 60 * 60 * 24)
    const three = new Date(now + 1000 * 60 * 60 * 48)
    const four = new Date(now + 1000 * 60 * 60 * 72)

    activities = [{
      _id: new ObjectID('activityid'),
      timeFrom: one,
      timeTo: three
    }]

    req.body = {
      timeFrom: two.toISOString(),
      timeTo: four.toISOString()
    }

    await updateActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()
  })

  it('Should check for conflicts (meanwhile and after)', async () => {
    next.mockClear()

    const now = Date.now()
    const one = new Date(now)
    const two = new Date(now + 1000 * 60 * 60 * 24)
    const three = new Date(now + 1000 * 60 * 60 * 48)
    const four = new Date(now + 1000 * 60 * 60 * 72)

    const conflict = {
      _id: new ObjectID('anotheractivityid'),
      timeFrom: two,
      timeTo: four
    }

    activities = [conflict]

    req.body = {
      timeFrom: one.toISOString(),
      timeTo: three.toISOString()
    }

    await updateActivity(req, res, next)

    expect(next).toHaveBeenLastCalledWith([409, {
      msg: expect.any(String),
      conflict
    }])
  })

  it('Should check for conflicts (after)', async () => {
    next.mockClear()

    const now = Date.now()
    const one = new Date(now)
    const two = new Date(now + 1000 * 60 * 60 * 24)
    const three = new Date(now + 1000 * 60 * 60 * 48)
    const four = new Date(now + 1000 * 60 * 60 * 72)

    activities = [{
      _id: new ObjectID('anotheractivityid'),
      timeFrom: three,
      timeTo: four
    }]

    req.body = {
      timeFrom: one.toISOString(),
      timeTo: two.toISOString()
    }

    await updateActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()
  })

  it('Should check for conflicts (same)', async () => {
    next.mockClear()

    const now = Date.now()
    const one = new Date(now)
    const two = new Date(now + 1000 * 60 * 60 * 24)

    const conflict = {
      _id: new ObjectID('anotheractivityid'),
      timeFrom: one,
      timeTo: two
    }

    activities = [conflict]

    req.body = {
      timeFrom: one.toISOString(),
      timeTo: two.toISOString()
    }

    await updateActivity(req, res, next)

    expect(next).toHaveBeenLastCalledWith([409, {
      msg: expect.any(String),
      conflict
    }])
  })

  it('Should check for budget conflicts', async () => {
    res.status.mockClear()
    res.send.mockClear()

    const now = Date.now()
    const originalGetProject = getProject

    getProject = () => {
      const project = originalGetProject()
      project.budget = 10
      project.people[0].budget = 5
      project.people[1].budget = 5
      return project
    }

    const project = getProject()
    const activitiesWithBudget = [{
      _id: new ObjectID('anotheractivityid'),
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom: new Date(now),
      timeTo: new Date(now + 1000 * 60 * 60 * 1)
    }, {
      _id: new ObjectID('anotheranotheractivityid'),
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom: new Date(now + 1000 * 60 * 60 * 2),
      timeTo: new Date(now + 1000 * 60 * 60 * 4)
    }]

    getDb.setResult('find', activitiesWithBudget)

    const timeFrom = new Date(now + 1000 * 60 * 60 * 5).toISOString()
    const timeTo = new Date(now + 1000 * 60 * 60 * 8).toISOString()

    req.body = {
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom,
      timeTo
    }

    await updateActivity(req, res, next)

    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [
        expect.objectContaining({
          location: 'body',
          param: 'timeTo',
          value: timeTo
        })
      ]
    })

    getProject = originalGetProject
    getDb.setResult('find', activities)
  })

  it('Should ignore current activity when checking for budget conflicts', async () => {
    res.status.mockClear()
    res.send.mockClear()

    const now = Date.now()
    const originalGetProject = getProject

    getProject = () => {
      const project = originalGetProject()
      project.budget = 10
      project.people[0].budget = 5
      project.people[1].budget = 5
      return project
    }

    const project = getProject()
    const activitiesWithBudget = [{
      _id: new ObjectID('activityid'),
      project: project._id,
      recipient: getMasterUser(),
      timeFrom: new Date(now),
      timeTo: new Date(now + 1000 * 60 * 60 * 1)
    }, {
      _id: new ObjectID('anotheractivityid'),
      project: project._id,
      recipient: getMasterUser()._id,
      timeFrom: new Date(now + 1000 * 60 * 60 * 2),
      timeTo: new Date(now + 1000 * 60 * 60 * 4)
    }]

    getDb.setResult('find', activitiesWithBudget)

    const timeFrom = new Date(now + 1000 * 60 * 60 * 5).toISOString()
    const timeTo = new Date(now + 1000 * 60 * 60 * 8).toISOString()

    req.body = {
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom,
      timeTo
    }

    await updateActivity(req, res, next)

    expect(res.status).not.toHaveBeenCalled()

    getProject = originalGetProject
    getDb.setResult('find', activities)
  })

  it('Should ignore budget if none is set', async () => {
    res.status.mockClear()
    res.send.mockClear()

    const now = Date.now()
    const project = getProject()
    const activitiesWithBudget = [{
      _id: new ObjectID('anotheractivityid'),
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom: new Date(now),
      timeTo: new Date(now + 1000 * 60 * 60 * 1)
    }, {
      _id: new ObjectID('anotheranotheractivityid'),
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom: new Date(now + 1000 * 60 * 60 * 2),
      timeTo: new Date(now + 1000 * 60 * 60 * 4)
    }]

    getDb.setResult('find', activitiesWithBudget)

    const timeFrom = new Date(now + 1000 * 60 * 60 * 5).toISOString()
    const timeTo = new Date(now + 1000 * 60 * 60 * 370).toISOString()

    req.body = {
      project: project._id.toString(),
      recipient: getMasterUser()._id.toString(),
      timeFrom,
      timeTo
    }

    await updateActivity(req, res, next)

    expect(res.status).not.toHaveBeenCalled()

    getDb.setResult('find', activities)
  })

  it('Should call getActivityFromDb', async () => {
    getActivityFromDb.mockClear()
    req.body = { title: 'Some title' }
    await updateActivity(req, res, next)
    expect(getActivityFromDb).toHaveBeenCalled()
  })

  it('Should update lastUpdateDate', async () => {
    getDb.functions.updateOne.mockClear()
    req.body = { title: 'Some title' }
    await updateActivity(req, res, next)
    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith(expect.any(Object), {
      $set: expect.objectContaining({
        lastUpdateDate: expect.any(Date)
      })
    })
  })
})
