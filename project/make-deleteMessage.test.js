const makeDeleteMessage = require('./make-deleteMessage')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('deleteMessage', () => {
  const createError = (httpCode, message) => [httpCode, message]
  const deleteMessage = makeDeleteMessage({ getDb, ObjectID, createError, gt })

  const req = {
    session: { user: { _id: new ObjectID('currentuserid') } },
    params: {
      id: 'projectid',
      messageId: 'messageid'
    }
  }

  const res = { end: jest.fn() }
  const next = jest.fn()

  const getMessage = () => ({
    _id: new ObjectID('messageid'),
    project: new ObjectID('projectid'),
    from: new ObjectID('currentuserid')
  })

  getDb.setResult('findOne', getMessage)

  it('Should check that the message exists', async () => {
    await deleteMessage(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: new ObjectID(req.params.messageId) })
  })

  it('Should check that the project is right', async () => {
    next.mockClear()
    const message = getMessage()
    message.project = new ObjectID('someotherproject')
    getDb.setResult('findOne', message)

    await deleteMessage(req, res, next)

    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: new ObjectID(req.params.messageId) })
    expect(next).toHaveBeenCalledWith([422, {
      location: 'params',
      param: 'id',
      value: req.params.id,
      msg: expect.any(String)
    }])

    getDb.setResult('findOne', getMessage)
  })

  it('Should check that the user wrote the message', async () => {
    next.mockClear()
    const message = getMessage()
    message.from = new ObjectID('someotheruser')
    getDb.setResult('findOne', message)

    await deleteMessage(req, res, next)

    expect(next).toHaveBeenCalledWith([401, expect.any(String)])

    getDb.setResult('findOne', getMessage)
  })

  it('Should work', async () => {
    await deleteMessage(req, res, next)
    expect(getDb.functions.deleteOne).toHaveBeenLastCalledWith({
      _id: new ObjectID(req.params.messageId)
    })
  })
})
