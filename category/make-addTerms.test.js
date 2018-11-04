const makeAddTerms = require('./make-addTerms')

describe('addTerms', () => {
  let findOneResult
  const findOne = jest.fn(() => findOneResult)
  const updateOne = jest.fn()
  const collection = () => ({ findOne, updateOne })
  const getDb = () => ({ collection })
  const createError = (code, message) => [code, message]

  class ObjectID {
    constructor(string) {
      this.string = string
    }
  }

  const addTerms = makeAddTerms({ getDb, ObjectID, createError })
  const req = { params: { id: '1234567890abcdef' } }
  const next = jest.fn()
  const res = { send: jest.fn() }
  const data = {
    terms: [{
      name: 'name'
    }, {
      name: 'another name'
    }]
  }

  const category = {
    _id: new ObjectID('1234567890abcdef'),
    name: 'category name',
    terms: [{
      _id: new ObjectID('1234567890abcdef'),
      name: 'existing term name',
      projects: ['1234567890abcdef']
    }]
  }

  const prepare = () => {
    findOneResult = JSON.parse(JSON.stringify(category))
    req.body = JSON.parse(JSON.stringify(data))
  }

  it('Should work', async () => {
    prepare()
    await addTerms(req, res, next)
    expect(res.send).toHaveBeenCalled()
  })

  it('Should check that the category exists', async () => {
    prepare()
    await addTerms(req, res, next)
    expect(findOne).toHaveBeenLastCalledWith({ _id: category._id })
  })

  it('Should not save any extra information', async () => {
    const extra = 'I shall not be saved'
    prepare()
    req.body.terms[0].extra = extra
    await addTerms(req, res, next)
    expect(updateOne).toHaveBeenLastCalledWith(expect.anything(), {
      $push: {
        terms: {
          $each: [expect.not.objectContaining({ extra }), expect.any(Object)]
        }
      }
    })
  })

  it('Should create an id for each term', async () => {
    prepare()
    await addTerms(req, res, next)
    expect(updateOne).toHaveBeenLastCalledWith(expect.anything(), {
      $push: {
        terms: {
          $each: [
            expect.objectContaining({ _id: new ObjectID() }),
            expect.objectContaining({ _id: new ObjectID() })
          ]
        }
      }
    })
  })

  it('Should create an empty projects array for each term', async () => {
    prepare()
    await addTerms(req, res, next)
    expect(updateOne).toHaveBeenLastCalledWith(expect.anything(), {
      $push: {
        terms: {
          $each: [
            expect.objectContaining({ projects: [] }),
            expect.objectContaining({ projects: [] })
          ]
        }
      }
    })
  })

  it('Should override an eventually provided term ID', async () => {
    prepare()
    req.body.terms[0]._id = new ObjectID('something')
    await addTerms(req, res, next)
    expect(updateOne).toHaveBeenLastCalledWith(expect.anything(), {
      $push: {
        terms: {
          $each: [
            expect.objectContaining({ _id: new ObjectID() }),
            expect.any(Object)
          ]
        }
      }
    })
  })

  it('Should override an eventually provided projects array', async () => {
    prepare()
    req.body.terms[0].projects = 'whatever'
    await addTerms(req, res, next)
    expect(updateOne).toHaveBeenLastCalledWith(expect.anything(), {
      $push: {
        terms: {
          $each: [
            expect.objectContaining({ projects: [] }),
            expect.any(Object)
          ]
        }
      }
    })
  })

  it('Should return the updated category', async () => {
    prepare()
    await addTerms(req, res, next)
    expect(res.send).toHaveBeenLastCalledWith(Object.assign({}, category, {
      terms: category.terms.concat(Array.from(data.terms).map(term => ({
        name: term.name,
        _id: new ObjectID,
        projects: []
      })))
    }))
  })
})
