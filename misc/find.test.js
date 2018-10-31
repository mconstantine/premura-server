const find = require('./find')

describe('find', () => {
  const collection = { createIndex: jest.fn(), find: jest.fn() }

  it('Should perform a regex search', async () => {
    await find(collection, { name: 'nameQuery', text: 'textQuery' }, { answer: 42 })
    expect(collection.find).toHaveBeenCalledWith({
      name: { $regex: /nameQuery/gi },
      text: { $regex: /textQuery/gi }
    }, {
      answer: 42
    })
  })

  it('Should escape regular expressions', async () => {
    collection.find.mockClear()
    await find(collection, { name: '[-]{}()*+?.,\\^$|#' })

    expect(collection.find).toHaveBeenCalledWith({
      name: { $regex: /\[\-\]\{\}\(\)\*\+\?\.\,\\\^\$\|\#/gi }
    }, undefined)
  })
})
