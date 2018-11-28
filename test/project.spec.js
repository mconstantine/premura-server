const client = require('./getClient')('http://localhost:3000')
const faker = require('faker')
const status = require('../misc/status')
const roles = require('../misc/roles')

describe('project', () => {
  const now = Date.now()
  const projectsIds = [], usersIds = [], categories = []
  let exampleProject, exampleDestinationProject
  let anotherUser

  afterAll(async () => {
    for (_id of usersIds) {
      const response = await client.delete(`/users/${_id}/`)
      expect(response.status).toBe(200)
    }

    for ({ _id } of categories) {
      const response = await client.delete(`/categories/${_id}/`)
      expect(response.status).toBe(200)
    }
  })

  it('Should create projects', async () => {
    for (let i = 0; i < 10; i++) {
      const project = {
        name: faker.lorem.words(1 + Math.round(Math.random() * 3)),
        description: faker.lorem.words(2 + Math.round(Math.random() * 28)),
        budget: 8 + Math.round(Math.random() * 92),
        status: status[Math.round(Math.random() * (status.length - 1))]
      }

      const response = await client.post('/projects/', {
        body: project
      })
      const content = await response.json()

      expect(response.status).toBe(201)
      projectsIds.push(content._id)
    }
  })

  it('Should return a single project', async () => {
    let response, content
    const randomIndex = Math.round(Math.random() * (projectsIds.length - 1))
    const randomProjectId = projectsIds[randomIndex]

    response = await client.get(`/projects/${randomProjectId}/`)
    content = await response.json()

    expect(response.status).toBe(200)
    exampleProject = content

    const randomDestinationIndex = (randomIndex + 1) % projectsIds.length
    const randomDestinationProjectId = projectsIds[randomDestinationIndex]

    response = await client.get(`/projects/${randomDestinationProjectId}/`)
    content = await response.json()

    exampleDestinationProject = content
  })

  it('Should add people', async () => {
    // Initialization
    for (let i = 0; i < 4; i++) {
      const password = faker.internet.password()
      const user = {
        name: faker.name.firstName() + ' ' + faker.name.lastName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password,
        role: roles[Math.round(Math.random() * (roles.length - 2))],
        jobRole: 'Example'
      }

      const response = await client.post('/users/', {
        body: user
      })
      const content = await response.json()

      expect(response.status).toBe(201)
      usersIds.push(content._id)

      if (!i) {
        anotherUser = {
          _id: content._id,
          email: user.email,
          password: user.password
        }
      }
    }

    // Actual test
    for (let i = 0; i < projectsIds.length; i++) {
      const _id = projectsIds[i]
      const projectPeople = [{
        _id: usersIds[i % 4]
      }, {
        _id: usersIds[(i + 2) % 4]
      }]

      const response = await client.post(`/projects/${_id}/people/`, {
        body: {
          people: projectPeople
        }
      })
      const content = await response.json()

      expect(response.status).toBe(200)
      expect(content.people.length).toBe(3)

      if (_id === exampleProject._id) {
        exampleProject = content
      }
    }
  })

  it('Should add deadlines', async () => {
    const deadlines = [
      new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString(),
      new Date(now + 1000 * 60 * 60 * 24 * 4).toISOString(),
      new Date(now + 1000 * 60 * 60 * 24 * 6).toISOString(),
      new Date(now + 1000 * 60 * 60 * 24 * 8).toISOString()
    ]

    for (let i = 0; i < projectsIds.length; i++) {
      const _id = projectsIds[i]
      const projectDeadlines = [
        deadlines[i % 4], deadlines[(i + 2) % 4]
      ]

      const response = await client.post(`/projects/${_id}/deadlines/`, {
        body: {
          deadlines: projectDeadlines
        }
      })

      expect(response.status).toBe(200)

      if (_id === exampleProject._id) {
        const content = await response.json()
        exampleProject = content
      }
    }
  })

  it('Should add terms (multiple terms)', async () => {
    // Initialization
    let response, content

    for (let i = 0; i < 2; i++) {
      const category = {
        name: faker.lorem.words(1 + Math.round(Math.random() * 3)),
        description: faker.lorem.words(2 + Math.round(Math.random() * 28)),
        allowsMultipleTerms: i % 2 === 0
      }

      response = await client.post('/categories/', {
        body: category
      })
      content = await response.json()

      expect(response.status).toBe(201)

      const categoryId = content._id

      const savingCategory = {
        _id: categoryId,
        termsIds: []
      }

      const terms = []

      for (let i = 0; i < 2; i++) {
        terms.push({
          name: faker.lorem.words(1 + Math.round(Math.random() * 3))
        })
      }

      response = await client.post(`/categories/${categoryId}/terms/`, {
        body: { terms }
      })
      content = await response.json()

      savingCategory.termsIds = content.terms.map(({ _id }) => _id)
      categories.push(savingCategory)
    }

    // Actual test
    const terms = categories[0].termsIds

    response = await client.post(`/projects/${exampleProject._id}/terms/`, {
      body: { terms }
    })
    content = await response.json()

    expect(content.categories[0]).toMatchObject({
      _id: categories[0]._id,
      terms: [
        expect.objectContaining({
          _id: categories[0].termsIds[0],
          projects: [exampleProject._id]
        }),
        expect.objectContaining({
          _id: categories[0].termsIds[1],
          projects: [exampleProject._id]
        })
      ]
    })

    exampleProject = content
  })

  it('Should add terms (mutually exclusive terms)', async () => {
    const terms = categories[1].termsIds

    response = await client.post(`/projects/${exampleProject._id}/terms/`, {
      body: { terms }
    })
    content = await response.json()

    expect(content.categories[0]).toMatchObject({
      _id: categories[1]._id,
      terms: [
        expect.objectContaining({
          _id: categories[1].termsIds[1],
          projects: [exampleProject._id]
        })
      ]
    })

    exampleProject = content
  })

  it('Should move terms', async () => {
    const response = await client.put(`/projects/${exampleProject._id}/terms/`, {
      body: {
        destination: exampleDestinationProject._id
      }
    })
    const content = await response.json()

    expect(content).toMatchObject({
      _id: exampleDestinationProject._id,
      categories: expect.arrayContaining([
        expect.objectContaining({
          _id: categories[0]._id,
          terms: [
            expect.objectContaining({
              _id: categories[0].termsIds[0]
            }),
            expect.objectContaining({
              _id: categories[0].termsIds[1]
            })
          ]
        }),
        expect.objectContaining({
          _id: categories[1]._id,
          terms: [
            expect.objectContaining({
              _id: categories[1].termsIds[1]
            })
          ]
        })
      ])
    })

    exampleProject.categories = []
    exampleDestinationProject = content
  })

  it('Should paginate projects', async () => {
    let response, content

    response = await client.get('/projects/?perPage=5&page=1')
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('2')
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/projects/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('2')
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/projects/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('2')
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should find projects by name', async () => {
    // Actual test
    const url = '/projects/?name=' + exampleProject.name.split(' ')[0]
    const response = await client.get(url)
    const content = await response.json()

    expect(content.length).toBeLessThan(projectsIds.length)
    expect(content).toContainEqual(
      expect.objectContaining({ _id: exampleProject._id })
    )
  })

  it('Should find projects by status', async () => {
    const response = await client.get('/projects/?status=' + exampleProject.status)
    const content = await response.json()

    expect(content.length).toBeLessThan(projectsIds.length)
    expect(content).toContainEqual(
      expect.objectContaining({ _id: exampleProject._id })
    )
  })

  it('Should find projects by people', async () => {
    const peopleString = exampleProject.people
    .slice(1)
    .map(
      ({ _id }) => `people[]=${_id}`
    )
    .join('&')

    const response = await client.get('/projects/?' + peopleString)
    const content = await response.json()

    expect(content.length).toBeLessThan(projectsIds.length)
    expect(content).toContainEqual(
      expect.objectContaining({ _id: exampleProject._id })
    )
  })

  it('Should find projects by deadline (before)', async () => {
    const url = '/projects/?before=' + encodeURIComponent(
      new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString()
    )

    const response = await client.get(url)
    const content = await response.json()

    expect(content.length).toBeGreaterThan(0)
    expect(content.length).toBeLessThan(projectsIds.length)
  })

  it('Should find projects by deadline (after)', async () => {
    const url = '/projects/?after=' + encodeURIComponent(
      new Date(now + 1000 * 60 * 60 * 24 * 8).toISOString()
    )

    const response = await client.get(url)
    const content = await response.json()

    expect(content.length).toBeGreaterThan(0)
    expect(content.length).toBeLessThan(projectsIds.length)
  })

  it('Should find projects by categories', async () => {
    const categoriesString = categories
    .slice(0, 1)
    .map(
      ({ _id }) => `categories[]=${_id}`
    )
    .join('&')

    const response = await client.get('/projects/?' + categoriesString)
    const content = await response.json()

    expect(content.length).toBeLessThan(projectsIds.length)
    expect(content).toContainEqual(
      expect.objectContaining({ _id: exampleDestinationProject._id })
    )
  })

  it('Should find projects by terms', async () => {
    const termsString = categories[1]
    .termsIds
    .map(_id => `terms[]=${_id}`)
    .join('&')

    const response = await client.get('/projects/?' + termsString)
    const content = await response.json()

    expect(content.length).toBeLessThan(projectsIds.length)
    expect(content).toContainEqual(
      expect.objectContaining({ _id: exampleDestinationProject._id })
    )
  })

  it('Should update a project', async () => {
    const update = {
      name: 'Awesome project',
      description: 'Lorem ipsum dolor sit amet updated',
      budget: 42,
      status: 'opened'
    }

    const response = await client.put(`/projects/${exampleProject._id}/`, {
      body: update
    })
    const content = await response.json()

    expect(response.status).toBe(200)
    expect(content.name).toBe(update.name)
    expect(content.description).toBe(update.description)
    expect(content.budget).toBe(update.budget)
    expect(content.status).toBe(update.status)

    exampleProject = Object.assign(exampleProject, update)
  })

  it('Should update people', async () => {
    exampleProject.people[0].budget = 5
    exampleProject.people[1].budget = 10
    exampleProject.people[2].budget = 27

    const response = await client.put(`/projects/${exampleProject._id}/people/`, {
      body: { people: exampleProject.people }
    })
    const content = await response.json()

    expect(content.people).toEqual(exampleProject.people)
  })

  it('Should remove people', async () => {
    const response = await client.delete(`/projects/${exampleProject._id}/people/`, {
      body: {
        people: exampleProject.people.slice(1).map(({ _id }) => ({ _id }))
      }
    })
    const content = await response.json()

    expect(content._id).toBe(exampleProject._id)
    expect(content.people.length).toBe(1)
    expect(content.people[0].budget).toBe(content.budget)
  })

  it('Should remove deadlines', async () => {
    const response = await client.delete(`/projects/${exampleProject._id}/deadlines/`, {
      body: {
        deadlines: exampleProject.deadlines
      }
    })
    const content = await response.json()

    expect(content._id).toBe(exampleProject._id)
    expect(content.deadlines.length).toBe(0)
  })

  it('Should remove terms', async () => {
    let response, content

    // Initialization
    response = await client.get(`/projects/${exampleDestinationProject._id}/`)
    content = await response.json()
    exampleDestinationProject = content

    // Actual test
    const terms = exampleDestinationProject.categories.reduce(
      (res, category) => res.concat(
        category.terms.map(({ _id }) => _id)
      ), []
    )

    response = await client.delete(`/projects/${exampleProject._id}/terms/`, {
      body: { terms }
    })
    content = await response.json()

    expect(content.categories.length).toBe(0)
  })

  it('Should not allow a not assigned user to see a project', async () => {
    let response

    response = await client.delete(`/projects/${exampleProject._id}/people/`, {
      body: {
        people: [{
          _id: anotherUser._id
        }]
      }
    })
    expect(response.status).toBe(200)

    response = await client.post('/users/login/', {
      body: {
        email: anotherUser.email,
        password: anotherUser.password
      }
    })
    expect(response.status).toBe(200)

    response = await client.get(`/projects/${exampleProject._id}/`)
    expect(response.status).toBe(401)

    await client.login()
  })

  it('Should delete projects', async () => {
    for (_id of projectsIds) {
      const response = await client.delete(`/projects/${_id}/`)
      expect(response.status).toBe(200)
    }
  })
})
