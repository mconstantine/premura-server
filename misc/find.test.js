const find = require('./find')

describe('find', () => {
  const collection = { createIndex: jest.fn(), find: jest.fn() }

  it('Should create an index', async () => {
    await find(collection, ['one', 'two'])
    expect(collection.createIndex).toHaveBeenCalledWith({
      one: 'text',
      two: 'text'
    })
  })

  it('Should perform a text search', async () => {
    await find(collection, ['one', 'two'], 'query', { answer: 42 })
    expect(collection.find).toHaveBeenCalledWith({
      $text: {
        $search: 'query'
      }
    }, {
      answer: 42
    })
  })
})
