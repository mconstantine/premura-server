const Client = require('./client')
const App = require('./app')
const teardown = require('./single-teardown')

describe('project', () => {
  afterAll(teardown)

  const client = new Client('http://localhost:3000')
  const app = new App(client)
  const projects = []

  beforeAll(async () => {
    await client.login()

    for (let i = 0; i < 13; i++) {
      const project = await app.createProject()
      projects.push(project)
    }
  })

  it('Should return a single project', async () => {
    const project = projects[0]
    const response = await client.get(`/projects/${project._id}/`, undefined, true)

    expect(response._id).toBe(project._id)
  })

  it('Should add people', async () => {
    const project = projects[1]
    const user = await app.createUser()
    const response = await client.post(`/projects/${project._id}/people/`, {
      people: [user]
    }, true)

    expect(response._id).toBe(project._id)
    expect(response.people.length).toBe(2)
  })

  it('Should add deadlines', async () => {
    const project = projects[2]
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    const response = await client.post(`/projects/${project._id}/deadlines/`, {
      deadlines: [deadline]
    }, true)

    expect(response._id).toBe(project._id)
    expect(response.deadlines).toEqual([deadline])
  })

  it('Should add terms (multiple terms)', async () => {
    let response
    const project = projects[3]
    const category = await app.createCategory({ allowsMultipleTerms: true })
    const terms = [
      app.createTerm(),
      app.createTerm()
    ]

    response = await client.post(`/categories/${category._id}/terms/`, { terms }, true)
    response = await client.post(`/projects/${project._id}/terms/`, {
      terms: response.terms.map(({ _id }) => _id)
    }, true)

    expect(response._id).toBe(project._id)
    expect(response.categories.length).toBe(1)
    expect(response.categories[0].terms.length).toBe(2)
    expect(response.categories[0].terms[0].projects).toEqual([project._id])
    expect(response.categories[0].terms[1].projects).toEqual([project._id])
  })

  it('Should add terms (mutually exclusive terms)', async () => {
    let response
    const project = projects[4]
    const category = await app.createCategory({ allowsMultipleTerms: false })
    const terms = [
      app.createTerm(),
      app.createTerm()
    ]

    response = await client.post(`/categories/${category._id}/terms/`, { terms }, true)
    response = await client.post(`/projects/${project._id}/terms/`, {
      terms: response.terms.map(({ _id }) => _id)
    }, true)

    expect(response._id).toBe(project._id)
    expect(response.categories.length).toBe(1)
    expect(response.categories[0].terms.length).toBe(1)
    expect(response.categories[0].terms[0].name).toBe(terms[1].name)
    expect(response.categories[0].terms[0].projects).toEqual([project._id])
  })

  it('Should move terms', async () => {
    let response
    const origin = projects[5]
    const destination = projects[6]
    const category = await app.createCategory({ allowsMultipleTerms: true })
    const terms = [
      app.createTerm(),
      app.createTerm()
    ]

    response = await client.post(`/categories/${category._id}/terms/`, { terms }, true)

    await client.post(`/projects/${origin._id}/terms/`, {
      terms: response.terms.map(({ _id }) => _id)
    })

    response = await client.put(`/projects/${origin._id}/terms/`, {
      destination: destination._id
    }, true)

    expect(response).toMatchObject({
      _id: destination._id,
      categories: expect.arrayContaining([
        expect.objectContaining({
          _id: category._id,
          terms: [
            expect.objectContaining({
              name: terms[0].name
            }),
            expect.objectContaining({
              name: terms[1].name
            })
          ]
        })
      ])
    })
  })

  it('Should paginate projects', async () => {
    let response, content

    response = await client.get('/projects/?perPage=1&page=1')
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(projects.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/projects/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(projects.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/projects/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(projects.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should find projects by name', async () => {
    const project = projects[7]
    const response = await client.get(`/projects/?name=${project.name.split(' ')[0]}`, undefined, true)

    expect(response.length).toBeLessThan(projects.length)
    expect(response).toContainEqual(
      expect.objectContaining({ _id: project._id })
    )
  })

  it('Should find projects by status', async () => {
    const project = projects[7]
    const response = await client.get(`/projects/?status=${project.status}`, undefined, true)

    expect(response.length).toBeLessThan(projects.length)
    expect(response).toContainEqual(
      expect.objectContaining({ _id: project._id })
    )
  })

  it('Should find projects by people', async () => {
    const project = projects[7]
    const user = await app.createUser()

    await client.post(`/projects/${project._id}/people/`, {
      people: [{ _id: user._id }]
    })

    const response = await client.get(
      `/projects/?people[]=${user._id}`, undefined, true
    )

    expect(response).toEqual([
      expect.objectContaining({ _id: project._id })
    ])
  })

  it('Should find projects by deadline (before)', async () => {
    let response
    const project = projects[7]
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()

    await client.post(`/projects/${project._id}/deadlines/`, { deadlines: [deadline] })

    response = await client.get(
      `/projects/?before=${encodeURIComponent(
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
      )}`,
      undefined,
      true
    )

    expect(response).toContainEqual(expect.objectContaining({ _id: project._id }))

    response = await client.get(
      `/projects/?before=${encodeURIComponent(
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString()
      )}`,
      undefined,
      true
    )

    expect(response).not.toContainEqual(expect.objectContaining({ _id: project._id }))
  })

  it('Should find projects by deadline (after)', async () => {
    let response
    const project = projects[7]
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()

    await client.post(`/projects/${project._id}/deadlines/`, { deadlines: [deadline] })

    response = await client.get(
      `/projects/?after=${encodeURIComponent(
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString()
      )}`,
      undefined,
      true
    )

    expect(response).toContainEqual(expect.objectContaining({ _id: project._id }))

    response = await client.get(
      `/projects/?after=${encodeURIComponent(
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
      )}`,
      undefined,
      true
    )

    expect(response).not.toContainEqual(expect.objectContaining({ _id: project._id }))
  })

  it('Should find projects by categories', async () => {
    let response
    const project = projects[7]
    const category = await app.createCategory()
    const term = app.createTerm()

    response = await client.post(`/categories/${category._id}/terms/`, { terms: [term] }, true)
    await client.post(`/projects/${project._id}/terms/`, { terms: [response.terms[0]._id] })

    response = await client.get(`/projects/?categories[]=${category._id}`, undefined, true)
    expect(response).toEqual([
      expect.objectContaining({ _id: project._id })
    ])
  })

  it('Should find projects by terms', async () => {
    let response
    const project = projects[7]
    const category = await app.createCategory()
    const term = app.createTerm()

    response = await client.post(`/categories/${category._id}/terms/`, { terms: [term] }, true)

    const termId = response.terms[0]._id
    await client.post(`/projects/${project._id}/terms/`, { terms: [termId] })

    response = await client.get(`/projects/?terms[]=${termId}`, undefined, true)
    expect(response).toEqual([
      expect.objectContaining({ _id: project._id })
    ])
  })

  it('Should update a project', async () => {
    const project = projects[8]
    const update = {
      name: 'Project update name',
      description: 'Project update description',
      budget: 41,
      status: 'opened'
    }

    const response = await client.put(`/projects/${project._id}/`, update, true)

    expect(response._id).toBe(project._id)
    expect(response.name).toBe(update.name)
    expect(response.description).toBe(update.description)
    expect(response.budget).toBe(update.budget)
    expect(response.status).toBe(update.status)
  })

  it('Should update people and redo budget', async () => {
    const project = projects[9]
    const budget = 41
    const users = [
      await app.createUser(),
      await app.createUser()
    ]

    await client.put(`/projects/${project._id}/`, { budget }, true)

    const response = await client.post(`/projects/${project._id}/people/`, {
      people: users.map(({ _id}) => ({ _id }))
    }, true)

    expect(response._id).toBe(project._id)

    expect(response.people).toContainEqual(expect.objectContaining({
      _id: users[0]._id,
      budget: 14
    }))

    expect(response.people).toContainEqual(expect.objectContaining({
      _id: users[1]._id,
      budget: 14
    }))

    expect(response.people).toContainEqual(expect.objectContaining({
      _id: client.getUser()._id,
      budget: 13
    }))
  })

  it('Should remove people', async () => {
    const project = projects[10]
    const budget = 41
    const users = [
      await app.createUser(),
      await app.createUser()
    ]

    await client.put(`/projects/${project._id}/`, { budget }, true)
    await client.post(`/projects/${project._id}/people/`, {
      people: users.map(({ _id}) => ({ _id }))
    })

    const response = await client.delete(`/projects/${project._id}/people/`, {
      people: users.slice(1).map(({ _id }) => ({ _id }))
    }, true)

    expect(response._id).toBe(project._id)
    expect(response.people.length).toBe(2)

    expect(response.people).toContainEqual(expect.objectContaining({
      _id: users[0]._id,
      budget: 20
    }))

    expect(response.people).toContainEqual(expect.objectContaining({
      _id: client.getUser()._id,
      budget: 21
    }))
  })

  it('Should remove deadlines', async () => {
    const project = projects[9]
    const deadlines = [
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
    ]

    await client.post(`/projects/${project._id}/deadlines/`, { deadlines })

    const response = await client.delete(`/projects/${project._id}/deadlines/`, {
      deadlines: [deadlines[1]]
    }, true)

    expect(response._id).toBe(project._id)
    expect(response.deadlines).toEqual([deadlines[0], deadlines[2]])
  })

  // Working roughly 20% of the time (?!)
  it.skip('Should remove terms', async () => {
    let response
    const project = projects[9]
    const category = await app.createCategory()
    const terms = [
      app.createTerm({ name: 'one' }),
      app.createTerm({ name: 'two' }),
      app.createTerm({ name: 'three' })
    ]

    response = await client.post(`/categories/${category._id}/terms/`, { terms }, true)

    const termsIds = response.terms.map(({ _id }) => _id)

    await client.post(`/projects/${project._id}/terms/`, {
      terms: termsIds
    })

    response = await client.delete(`/projects/${project._id}/terms/`, {
      terms: [termsIds[2]]
    }, true)

    expect(response).toMatchObject({
      _id: project._id,
      categories: expect.arrayContaining([
        expect.objectContaining({
          _id: category._id,
          terms: expect.arrayContaining([
            expect.objectContaining({ _id: termsIds[0] }),
            expect.objectContaining({ _id: termsIds[1] })
          ])
        })
      ])
    })
  })

  it('Should not allow a not assigned user to see a project', async () => {
    const project = projects[11]
    const user = await app.createUser()

    await client.post('/users/login/', {
      email: user.email,
      password: user.password,
      lang: user.lang
    })

    const response = await client.get(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    await client.login()
  })

  it('Should delete projects', async () => {
    const project = projects[12]

    await client.delete(`/projects/${project._id}/`)

    const response = await client.get(`/projects/${project._id}/`)
    expect(response.status).toBe(404)
  })
})
