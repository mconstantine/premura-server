const Client = require('./client')
const App = require('./app')

describe('category', () => {
  const client = new Client('http://localhost:3000')
  const app = new App(client)
  const categories = []

  beforeAll(async () => {
    await client.login()

    for (let i = 0; i < 6; i++) {
      const category = await app.createCategory()
      categories.push(category)
    }
  })

  it('Should add terms', async () => {
    const category = categories[0]
    const terms = []

    for (let i = 0; i < 2; i++) {
      terms.push(app.createTerm())
    }

    const response = await client.post(`/categories/${category._id}/terms/`, { terms })
    expect(response.status).toBe(200)
  })

  it('Should update categories', async () => {
    let category = categories[1]
    const update = {
      name: 'Updated name',
      description: 'This is an updated description',
      allowsMultipleTerms: !category.allowsMultipleTerms
    }

    const content = await client.put(`/categories/${category._id}/`, update, true)

    expect(content.name).toBe(update.name)
    expect(content.description).toBe(update.description)
    expect(content.allowsMultipleTerms).toBe(update.allowsMultipleTerms)
  })

  it('Should paginate categories', async () => {
    let response, content

    response = await client.get('/categories/?perPage=1&page=1')
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(categories.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/categories/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(categories.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/categories/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(categories.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should sort categories by name', async () => {
    const getNames = arr => arr.map(({ name }) => ({ name }))

    const content = await client.get('/categories/', undefined, true)
    const received = getNames(content)
    const expected = getNames(content)

    expected.sort((a, b) => a.name > b.name ? 1 : -1)
    expect(received).toEqual(expected)
  })

  it('Should find categories by name', async () => {
    const category = categories[2]
    const target = category.name.split(' ')[0]
    const content = await client.get(`/categories/?name=${target}`, undefined, true)

    expect(content.length).toBeLessThan(categories.length)
    expect(content).toContainEqual(expect.objectContaining({ _id: category._id }))
  })

  it('Should remove terms', async () => {
    const category = categories[3]
    let content
    let terms = [
      app.createTerm(),
      app.createTerm(),
      app.createTerm()
    ]

    content = await client.post(`/categories/${category._id}/terms/`, { terms }, true)
    terms = content.terms

    content = await client.delete(`/categories/${category._id}/terms/`, {
      terms: [{ _id: terms[1]._id }]
    }, true)

    expect(content.terms).toContainEqual(expect.objectContaining({ _id: terms[0]._id }))
    expect(content.terms).not.toContainEqual(expect.objectContaining({ _id: terms[1]._id }))
    expect(content.terms).toContainEqual(expect.objectContaining({ _id: terms[2]._id }))
  })

  it('Should delete categories', async () => {
    const category = categories[4]
    await client.delete(`/categories/${category._id}/`)

    const content = await client.get('/categories/', undefined, true)
    expect(content).not.toContainEqual(expect.objectContaining({ _id: category._id }))
  })

  it('Should return a single category', async () => {
    const category = categories[5]
    const content = await client.get(`/categories/${category._id}/`, undefined, true)

    expect(content._id).toEqual(category._id)
  })
})
