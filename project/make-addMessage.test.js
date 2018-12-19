const makeAddMessage = require('./make-addMessage')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('addMessage', () => {
  const createError = (httpCode, message) => [httpCode, message]

  let userCanReadProjectResult = true
  const userCanReadProject = () => userCanReadProjectResult

  const addMessage = makeAddMessage({ getDb, ObjectID, createError, userCanReadProject, gt })

  const req = {
    session: { user: { _id: new ObjectID('me') } },
    params: { id: 'someprojectid' },
    body: { content: 'Hello' }
  }

  const res = { send: jest.fn() }
  const next = jest.fn()

  getDb.setResult('findOne', {
    people: [new ObjectID('me')]
  })

  getDb.setResult('insertOne', { insertedId: 'insertedid' })

  it('Should check that project exists', async () => {
    getDb.functions.findOne.mockClear()
    await addMessage(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(req.params.id) })
  })

  it('Should check that the user can read the project', async () => {
    next.mockClear()
    userCanReadProjectResult = false
    await addMessage(req, res, next)
    expect(next).toHaveBeenLastCalledWith([401, expect.any(String)])
    userCanReadProjectResult = true
  })

  it('Should save the sender id', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({ from: req.session.user._id })
    )
  })

  it('Should save the project id', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({ project: new ObjectID(req.params.id) })
    )
  })

  it('Should save creationDate', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({ creationDate: expect.any(Date) })
    )
  })

  it('Should save lastUpdateDate', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({ lastUpdateDate: expect.any(Date) })
    )
  })
})
