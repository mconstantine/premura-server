const client = require('./getClient')('http://localhost:3000')
const faker = require('faker')

describe('category', () => {
  let categories = []

  it('Should create categories', async () => {
    for (let i = 0; i < 5; i++) {
      const category = {
        name: faker.lorem.words(1 + Math.round(Math.random() * 2)),
        description: faker.lorem.words(5 + Math.round(Math.random() * 25)),
        allowsMultipleTerms: Math.random() > 0.5
      }

      const response = await client.post('/categories/', {
        body: category
      })
      const content = await response.json()

      expect(response.status).toBe(201)

      categories.push(Object.assign(category, {
        _id: content._id
      }))
    }
  })

  it('Should add terms', async () => {
    categories = await Promise.all(categories.map(async category => {
      const terms = []

      for (let i = 0; i < 2; i++) {
        terms.push({
          name: faker.lorem.words(1 + Math.round(Math.random() * 1))
        })
      }

      const response = await client.post(`/categories/${category._id}/terms/`, {
        body: { terms }
      })
      const content = await response.json()

      expect(response.status).toBe(200)
      category.terms = content.terms
      return category
    }))
  })

  it('Should update categories', async () => {
    let category = categories[Math.round(Math.random() * (categories.length - 1))]
    const update = {
      name: 'Updated name',
      description: 'This is an updated description',
      allowsMultipleTerms: !category.allowsMultipleTerms
    }

    const response = await client.put(`/categories/${category._id}/`, {
      body: update
    })
    const content = await response.json()

    expect(content.name).toBe(update.name)
    expect(content.description).toBe(update.description)
    expect(content.allowsMultipleTerms).toBe(update.allowsMultipleTerms)

    category = Object.assign(category, update)
  })

  it('Should paginate categories', async () => {
    let response, content

    response = await client.get('/categories/?perPage=2&page=1')
    content = await response.json()

    expect(content.length).toBe(2)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/categories/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(2)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/categories/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(2)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should sort categories by name', async () => {
    const getNames = arr => arr.map(({ name }) => ({ name }))

    const sortedCategories = getNames(categories)
    sortedCategories.sort((a, b) => a.name > b.name ? 1 : -1)

    const response = await client.get('/categories/')
    const content = await response.json()

    expect(getNames(content)).toEqual(sortedCategories)
  })

  it('Should find categories by name', async () => {
    const response = await client.get('/categories/?name=Updated')
    const content = await response.json()

    expect(content.length).toBeLessThan(categories.length)
    expect(content).toContainEqual(expect.objectContaining({ name: 'Updated name' }))
  })

  it('Should remove terms', async () => {
    const category = categories[Math.round(Math.random() * (categories.length - 1))]
    const term = category.terms[Math.round(Math.random() * (category.terms.length - 1))]

    const response = await client.delete(`/categories/${category._id}/terms/`, {
      body: {
        terms: [{
          _id: term._id
        }]
      }
    })
    const content = await response.json()

    expect(response.status).toBe(200)
    expect(content._id).toBe(category._id)
    expect(content.terms.length).toBe(1)
    expect(content.terms).not.toContainEqual({ _id: term._id })
  })

  it('Should delete categories', async () => {
    await Promise.all(categories.map(async category => {
      const response = await client.delete(`/categories/${category._id}`)
      expect(response.status).toBe(200)
    }))
  })
})
