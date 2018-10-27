let findOneReturnValue, compareReturnValue

const createError = (code, message) => [code, message]
const bcrypt = { compare: jest.fn(() => compareReturnValue) }
const findOne = jest.fn(() => findOneReturnValue)
const collection = ({ findOne })
const getDb = () => ({ collection: () => collection })
const login = require('./login')

describe('login', () => {
  const trim = jest.fn(x => x)
  const doLogin = login({ bcrypt, createError, trim, getDb })

  const completeData = {
    email: 'john.doe@example.com',
    password: 'password'
  }

  const req = { session: {} }
  const res = { end: () => {} }
  const next = jest.fn()

  it('Should clean data', async () => {
    req.body = Object.assign({}, completeData)
    await doLogin(req, res, next)
    expect(trim).toHaveBeenNthCalledWith(1, completeData.email)
    expect(trim).toHaveBeenNthCalledWith(2, completeData.password)
  })

  it('Should validate data', async () => {
    req.body = Object.assign({}, completeData)
    delete req.body.email
    await doLogin(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('email')])

    req.body = Object.assign({}, completeData)
    delete req.body.password
    await doLogin(req, res, next)
    expect(next).toHaveBeenLastCalledWith([400, expect.stringContaining('password')])
  })

  it('Should check for the user in the database', async () => {
    findOne.mockClear()
    req.body = Object.assign({}, completeData)
    await doLogin(req, res, next)
    expect(findOne).toHaveBeenCalledWith({ email: completeData.email })
  })

  it('Should compare the encrypted password', async () => {
    req.body = Object.assign({}, completeData)
    findOneReturnValue = Object.assign({}, completeData, { password: '3ncrypt3d' })
    compareReturnValue = true
    await doLogin(req, res, next)
    expect(bcrypt.compare).toHaveBeenCalledWith(completeData.password, '3ncrypt3d')
  })

  it('Should not allow an invalid password', async () => {
    next.mockClear()
    req.body = Object.assign({}, completeData)
    findOneReturnValue = Object.assign({}, completeData, { password: '3ncrypt3d' })
    compareReturnValue = false
    await doLogin(req, res, next)
    expect(next).toHaveBeenCalledWith([401, expect.any(String)])
    compareReturnValue = true
  })

  it('Should set the session discarding the password', async () => {
    delete req.session.user
    req.body = Object.assign({}, completeData)
    await doLogin(req, res, next)
    expect(req.session.user).toBeInstanceOf(Object)
    expect(req.session.user).not.toHaveProperty('password')
  })
})
