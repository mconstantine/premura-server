const makeGetUser = require('./make-getUser')

describe('getUser', () => {
  let findOneResult = true
  const findOne = () => findOneResult
  const collection = () => ({ findOne })
  const getDb = () => ({ collection })
  const createError = (code, message) => [code, message]

  let shouldObjectIDFail = false
  class ObjectID {
    constructor(string) {
      if (shouldObjectIDFail) {
        throw new Error('Failing!')
      }

      this.string = string
    }

    equals(string) {
      return string === this.string
    }
  }

  const id = '1234567890abcdef'
  const req = { params: { id } }
  const res = { send: jest.fn() }
  const next = jest.fn()

  const getUser = makeGetUser({ getDb, createError, ObjectID })

  it('Should check that an ID is provided', async () => {
    req.params = {}

    await getUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('id')])

    req.params = { id }
  })

  it('Should handle ObjectID failing', async () => {
    shouldObjectIDFail = true
    await getUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    shouldObjectIDFail = false
  })

  it("Should fail if the user doesn't exist", async () => {
    findOneResult = false
    await getUser(req, null, next)
    expect(next).toHaveBeenLastCalledWith([404, expect.any(String)])
    findOneResult = true
  })

  it('Should work', async () => {
    await getUser(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(findOneResult)
  })

  it('Should hide sensible data', async () => {
    findOneResult = { answer: 42, email: 'should be hidden', password: 'should be hidden' }
    await getUser(req, res, next)

    const result = res.send.mock.calls.pop()[0]

    expect(result).not.toHaveProperty('email')
    expect(result).not.toHaveProperty('password')
  })
})
