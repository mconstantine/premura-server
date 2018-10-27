const logout = require('./logout')

describe('logout', () => {
  it('Should delete user from the session', () => {
    const req = { session: { user: true, somethingElse: true } }
    const res = { end: jest.fn() }

    logout(req, res)

    expect(req.session).not.toHaveProperty('user')
    expect(res.end).toHaveBeenCalled()
  })
})
