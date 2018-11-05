const find = require('./find')

describe('find', () => {
  it('Should perform a regex search', async () => {
    const query = find({ name: 'nameQuery', text: 'textQuery' })
    expect(query).toEqual({
      name: { $regex: /nameQuery/gi },
      text: { $regex: /textQuery/gi }
    })
  })

  it('Should escape regular expressions', async () => {
    const query = find({ name: '[-]{}()*+?.,\\^$|#' })

    expect(query).toEqual({
      name: { $regex: /\[\-\]\{\}\(\)\*\+\?\.\,\\\^\$\|\#/gi }
    })
  })
})
