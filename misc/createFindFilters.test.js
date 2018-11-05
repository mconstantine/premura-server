const createFindFilters = require('./createFindFilters')

describe('createFindFilters', () => {
  it('Should perform a regex search', async () => {
    const query = createFindFilters({ name: 'nameQuery', text: 'textQuery' })
    expect(query).toEqual({
      name: { $regex: /nameQuery/gi },
      text: { $regex: /textQuery/gi }
    })
  })

  it('Should escape regular expressions', async () => {
    const query = createFindFilters({ name: '[-]{}()*+?.,\\^$|#' })

    expect(query).toEqual({
      name: { $regex: /\[\-\]\{\}\(\)\*\+\?\.\,\\\^\$\|\#/gi }
    })
  })
})
