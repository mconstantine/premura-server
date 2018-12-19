const makeAddMessage = require('./make-addMessage')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('addMessage', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const addMessage = makeAddMessage({ getDb, ObjectID, createError, gt })

  const req = {
    session: { user: { _id: new ObjectID('me') } },
    params: { id: 'someprojectid' },
    body: { content: 'Hello' }
  }

  const res = { send: jest.fn() }
  const next = jest.fn()

  getDb.setResult('findOne', {})

  it('Should check that project exists', async () => {
    getDb.functions.findOne.mockClear()
    await addMessage(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenLastCalledWith({ _id: new ObjectID(req.params.id) })
  })

  it('Should create an _id', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(req.params.id)
    }, {
      $push: {
        messages: expect.objectContaining({ _id: new ObjectID() })
      }
    })
  })

  it('Should save creationDate', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(req.params.id)
    }, {
      $push: {
        messages: expect.objectContaining({ creationDate: expect.any(Date) })
      }
    })
  })

  it('Should save lastUpdateDate', async () => {
    await addMessage(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(req.params.id)
    }, {
      $push: {
        messages: expect.objectContaining({ lastUpdateDate: expect.any(Date) })
      }
    })
  })
})
