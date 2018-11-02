const makeGetJobRoles = require('./make-getJobRoles')
const getDb = require('../misc/test-getDb')

describe('getJobRoles', () => {
  getDb.setResult('distinct', ['one', 'two'])
  const getJobRoles = makeGetJobRoles({ getDb })
  const res = { send: jest.fn() }

  it('Should work', async () => {
    await getJobRoles(null, res)
    expect(res.send).toHaveBeenCalledWith(getDb.getResult('distinct'))
    expect(getDb.functions.distinct).toHaveBeenCalledWith('jobRole', {}, {})
  })
})
