const makeDeleteActivity = require('./make-deleteActivity')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('deleteProject', () => {
  let userCanReadProjectResult = true
  const userCanReadProject = () => userCanReadProjectResult
  const createError = (httpCode, message) => [httpCode, message]
  const deleteActivity = makeDeleteActivity({ getDb, ObjectID, createError, userCanReadProject, gt })
  const id = '1234567890abcdef'
  const req = { session: { user: { _id: new ObjectID('me'), role: 'manager' } }, params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn(), end: jest.fn() }
  const next = jest.fn()

  const activity = {
    _id: new ObjectID(id),
    recipient: new ObjectID('me'),
    project: new ObjectID('aprojectid')
  }

  const findOne = () => {
    switch (getDb.getCurrentCollection()) {
      case 'activities':
        return activity
      case 'projects':
        return { _id: new ObjectID('aprojectid') }
      default:
        return false
    }
  }

  getDb.setResult('findOne', findOne)

  it('Should check that the id is valid', async () => {
    res.end.mockClear()
    req.params = {}
    await deleteActivity(req, res)
    expect(res.end).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: expect.any(String)
      }]
    })
    req.params = { id }
  })

  it('Should check that the activity exist', async () => {
    next.mockClear()
    res.end.mockClear()
    getDb.setResult('findOne', false)
    await deleteActivity(req, res, next)
    expect(res.end).not.toHaveBeenCalled()
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(id) })
    getDb.setResult('findOne', findOne)
  })

  it('Should work', async () => {
    res.end.mockClear()
    await deleteActivity(req, res, next)
    expect(res.end).toHaveBeenCalled()
  })

  it("Should return 401 if the user can't read the project", async () => {
    userCanReadProjectResult = false
    next.mockClear()
    await deleteActivity(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it("Should not allow a maker to delete another user's activity", async () => {
    next.mockClear()
    req.session.user._id = new ObjectID('notme')
    req.session.user.role = 'maker'

    await deleteActivity(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])

    req.session.user._id = new ObjectID('me')
  })

  it('Should allow a maker to delete its own activity', async () => {
    next.mockClear()
    req.session.user._id = new ObjectID('notme')
    req.session.user.role = 'maker'
    activity.recipient = new ObjectID('notme')

    await deleteActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()

    req.session.user._id = new ObjectID('me')
    req.session.user.role = 'manager'
    activity.recipient = new ObjectID('me')
  })

  it("Should allow a manager to delete another user's activity", async () => {
    next.mockClear()
    activity.recipient = new ObjectID('notme')

    await deleteActivity(req, res, next)
    expect(next).not.toHaveBeenCalled()

    activity.recipient = new ObjectID('me')
  })
})
