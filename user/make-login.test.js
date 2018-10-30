let findOneReturnValue, compareReturnValue

const createError = (code, message) => [code, message]
const bcrypt = { compare: jest.fn(() => compareReturnValue) }
const findOne = jest.fn(() => findOneReturnValue)
const updateOne = jest.fn()
const collection = ({ findOne, updateOne })
const getDb = () => ({ collection: () => collection })
const makeLogin = require('./make-login')

describe('login', () => {
  const login = makeLogin({ bcrypt, createError, getDb })

  const data = {
    email: 'john.doe@example.com',
    password: 'password'
  }

  const req = { session: {} }
  const res = { send: jest.fn() }
  const next = jest.fn()

  it('Should check for the user in the database', async () => {
    findOne.mockClear()
    req.body = Object.assign({}, data)
    await login(req, res, next)
    expect(findOne).toHaveBeenCalledWith({ email: data.email }, expect.anything())
  })

  it('Should compare the encrypted password', async () => {
    req.body = Object.assign({}, data)
    findOneReturnValue = Object.assign({}, data, { password: '3ncrypt3d' })
    compareReturnValue = true
    await login(req, res, next)
    expect(bcrypt.compare).toHaveBeenCalledWith(data.password, '3ncrypt3d')
  })

  it('Should not allow an invalid password', async () => {
    next.mockClear()
    req.body = Object.assign({}, data)
    findOneReturnValue = Object.assign({}, data, { password: '3ncrypt3d' })
    compareReturnValue = false
    await login(req, res, next)
    expect(next).toHaveBeenCalledWith([401, expect.any(String)])
    compareReturnValue = true
  })

  it('Should set the session discarding the password', async () => {
    delete req.session.user
    req.body = Object.assign({}, data)
    await login(req, res, next)
    expect(req.session.user).toBeInstanceOf(Object)
    expect(req.session.user).not.toHaveProperty('password')
  })

  it('Should return the session', async () => {
    res.send.mockClear()
    req.body = Object.assign({}, data)
    await login(req, res, next)
    expect(res.send).toHaveBeenCalledWith(req.session.user)
  })

  it('Should hide sensitive information', async () => {
    res.send.mockClear()
    req.body = Object.assign({}, data)

    await login(req, res, next)

    expect(findOne).toHaveBeenCalledWith(expect.anything(), {
      projection: expect.objectContaining({
        email: 0,
        registrationDate: 0,
        lastLoginDate: 0
      })
    })
  })

  it('Should save the last login date', async () => {
    req.body = Object.assign({}, data)
    await login(req, res, next)
    expect(updateOne).toHaveBeenCalledWith(
      { email: data.email },
      { $set: expect.objectContaining({ lastLoginDate: expect.any(Date) }) }
    )
  })
})
