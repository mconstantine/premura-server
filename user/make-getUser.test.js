const makeGetUser = require('./make-getUser')

describe('getUser', () => {
  let findOneResult = true
  const findOne = jest.fn(() => findOneResult)
  const collection = () => ({ findOne })
  const getDb = () => ({ collection })
  const createError = (code, message) => [code, message]
  const sensitiveInformationProjection = { test: true }

  let shouldObjectIDFail = false
  class ObjectID {
    constructor(string) {
      if (shouldObjectIDFail) {
        throw new Error('Failing!')
      }

      this.string = string
    }

    static isValid(string) {
      return !!string
    }

    equals(string) {
      return string === this.string
    }
  }

  const id = '1234567890abcdef'
  const req = { params: { id } }
  const res = { status: jest.fn(() => res), send: jest.fn() }
  const next = jest.fn()

  const getUser = makeGetUser({ getDb, createError, ObjectID, sensitiveInformationProjection })

  it('Should check that an ID is provided', async () => {
    req.params = {}

    await getUser(req, res, next)
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenLastCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: 'invalid user id'
      }]
    })

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

  it('Should hide sensitive information', async () => {
    await getUser(req, res, next)

    expect(findOne).toHaveBeenLastCalledWith(expect.anything(), {
      projection: sensitiveInformationProjection
    })
  })
})
