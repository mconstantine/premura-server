const makeDeleteUser = require('./make-deleteUser')
const getDb = require('../misc/test-getDb')
const ObjectID = require('../misc/test-ObjectID')
const gt = require('../misc/test-gettext')

describe('deleteUser', () => {
  const id = '1234567890abcdef'
  const req = { params: { id }, session: { user: { role: 'master' } } }
  const next = jest.fn()
  const createError = (httpCode, message) => [httpCode, message]
  const res = { status: jest.fn(() => res), send: jest.fn(), end: () => {} }
  const deleteUser = makeDeleteUser({ createError, getDb, ObjectID, gt })

  const getUser = () => ({
    _id: new ObjectID(id),
    role: 'maker'
  })

  const getProjects = () => [{
    _id: new ObjectID('projectone'),
    budget: 41,
    people: [{
      _id: new ObjectID(id),
      budget: 41
    }]
  }, {
    _id: new ObjectID('projecttwo'),
    budget: 41,
    people: [{
      _id: new ObjectID(id),
      budget: 21,
    }, {
      _id: new ObjectID('someoneelse'),
      budget: 20,
    }]
  }]

  const getCategories = () => [{
    _id: new ObjectID('categoryone'),
    terms: [{
      _id: new ObjectID('termone'),
      projects: [new ObjectID('projectone'), new ObjectID('projecttwo')]
    }]
  }]

  const find = filters => {
    if (filters['people._id']) {
      return getProjects()
    }

    if (filters['terms.projects']) {
      return getCategories()
    }

    return false
  }

  getDb.setResult('findOne', getUser)
  getDb.setResult('find', find)

  it('Should check that an ID is provided', async () => {
    req.params = {}
    await deleteUser(req, res, next)
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: expect.any(String)
      }]
    })

    req.params = { id: id }
  })

  it('Should check for the user existence', async () => {
    getDb.functions.findOne.mockClear()
    await deleteUser(req, res, next)
    expect(getDb.functions.findOne).toHaveBeenCalledWith({ _id: new ObjectID(id) })
  })

  it('Should not allow a non master user to delete a user', async () => {
    req.session.user.role = 'manager'
    await deleteUser(req, res, next)
    expect(next).toHaveBeenCalledWith([401, expect.any(String)])
  })

  it('Should allow a master user to delete a user', async () => {
    next.mockClear()
    getDb.functions.deleteOne.mockClear()
    req.session.user.role = 'master'
    const user = getUser()
    user.role = 'master'
    getDb.setResult('findOne', user)
    getDb.setResult('find', find)
    await deleteUser(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(getDb.functions.deleteOne).toHaveBeenCalled()
    getDb.setResult('findOne', getUser)
    getDb.setResult('find', find)
  })

  it("Should remove user from projects' people and redo budgets", async () => {
    const projects = getProjects()
    getDb.functions.updateOne.mockClear()
    await deleteUser(req, res, next)

    expect(getDb.functions.updateOne).toHaveBeenNthCalledWith(1, {
      _id: projects[1]._id
    }, {
      $set: {
        people: [{
          _id: projects[1].people[1]._id,
          budget: 41
        }]
      }
    })
  })

  it(
    'Should remove projects that have this user as the only person (also from terms)',
    async () => {
      const projects = getProjects()
      const categories = getCategories()
      getDb.functions.updateOne.mockClear()
      getDb.functions.deleteOne.mockClear()
      await deleteUser(req, res, next)
      expect(getDb.functions.deleteOne).toHaveBeenCalledWith({
        _id: projects[0]._id
      })
      expect(getDb.functions.updateOne).toHaveBeenCalledWith({
        _id: categories[0]._id
      }, {
        $set: {
          terms: [{
            _id: categories[0].terms[0]._id,
            projects: [categories[0].terms[0].projects[1]]
          }]
        }
      })
    }
  )

  it('Should delete user activities', async () => {
    getDb.functions.deleteMany.mockClear()
    await deleteUser(req, res, next)
    expect(getDb.functions.deleteMany).toHaveBeenCalledWith({ recipient: new ObjectID(id) })
  })

  it("Should remove user from activities' people", async () => {
    getDb.functions.updateMany.mockClear()
    await deleteUser(req, res, next)

    expect(getDb.functions.updateMany).toHaveBeenLastCalledWith({
      people: new ObjectID(req.params.id)
    }, {
      $pull: {
        people: new ObjectID(req.params.id)
      }
    })
  })
})
