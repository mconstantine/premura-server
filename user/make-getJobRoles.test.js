const makeGetJobRoles = require('./make-getJobRoles')

describe('getJobRoles', () => {
  const result = ['one', 'two']
  const distinct = jest.fn(() => result)
  const collection = () => ({ distinct })
  const getDb = () => ({ collection })
  const getJobRoles = makeGetJobRoles({ getDb })
  const res = { send: jest.fn() }

  it('Should work', async () => {
    await getJobRoles(null, res)
    expect(res.send).toHaveBeenCalledWith(result)
    expect(distinct).toHaveBeenCalledWith('jobRole', {}, {})
  })
})
