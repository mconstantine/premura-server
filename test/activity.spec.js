const client = require('./getClient')('http://localhost:3000')
const faker = require('faker')
const pickRandom = require('../misc/pickRandom')

describe('activity', () => {
  let makerUser = {
    name: 'Maker User',
    email: 'maker@example.com',
    password: 'makeruser',
    role: 'maker',
    jobRole: 'Example'
  }

  const activities = [], projects = []

  beforeAll(async () => {
    let response, content

    response = await client.post('/users/', {
      body: Object.assign({}, makerUser, {
        passwordConfirmation: makerUser.password
      })
    })
    content = await response.json()

    makerUser._id = content._id

    for (let i = 0; i < 2; i++) {
      const project = { name: faker.lorem.words(pickRandom(3, 8)) }

      response = await client.post('/projects/', {
        body: project
      })
      content = await response.json()

      project._id = content._id
      projects.push(project)
    }
  })

  afterAll(async () => {
    await client.delete(`/users/${makerUser._id}/`)

    await Promise.all(projects.map(async project => {
      await client.delete(`/projects/${project._id}/`)
    }))
  })

  it('Should create activities', async () => {
    let response, content
    const currentUser = client.getCurrentUser()
    const now = Date.now()

    for (let i = 0; i < 6; i++) {
      const title = faker.lorem.words(pickRandom(3, 8))
      const recipient = pickRandom() ? currentUser._id : makerUser._id
      const project = pickRandom(projects)._id
      const timeFrom = new Date(now + 1000 * 60 * 60 * 24 * (i + 1))
      const timeTo = new Date(timeFrom.getTime() + 1000 * 60 * 60 * (i + 1))

      const activity = {
        title, recipient, project,
        timeFrom: timeFrom.toISOString(),
        timeTo: timeTo.toISOString()
      }

      // Assign the recipient to the project
      await client.post(`/projects/${project}/people/`, {
        body: {
          people: [{ _id: recipient }]
        }
      })

      response = await client.post('/activities/', {
        body: activity
      })
      content = await response.json()

      expect(response.status).toBe(201)

      activity._id = content._id
      activities.push(activity)
    }
  })

  it('Should look for people in recipient', async () => {
    const activity = activities[0]
    const response = await client.get(`/activities/?people[]=${activity.recipient}`)
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining(activity))
  })

  it('Should add people', async () => {
    const currentUser = client.getCurrentUser()
    const activity = activities.find(({ recipient }) => recipient === makerUser._id)

    const response = await client.post(`/activities/${activity._id}/people/`, {
      body: {
        people: [currentUser._id]
      }
    })
    const content = await response.json()

    expect(content.people).toContainEqual(expect.objectContaining({
      _id: currentUser._id
    }))

    activity.people = [currentUser._id]
  })

  it('Should update activity', async () => {
    const currentUser = client.getCurrentUser()
    const now = Date.now()
    const activity = activities.find(({ recipient }) => recipient === makerUser._id)
    const update = {
      title: 'Updated title',
      description: 'This is an updated description',
      project: projects[0]._id,
      recipient: currentUser._id,
      timeFrom: new Date(now + 1000 * 60 * 60 * 24 * 200).toISOString(),
      timeTo: new Date(now + 1000 * 60 * 60 * 24 * 200 + 1000 * 60 * 60 * 1).toISOString()
    }

    const response = await client.put(`/activities/${activity._id}/`, {
      body: update
    })
    const content = await response.json()

    expect(content.title).toBe(update.title)
    expect(content.description).toBe(update.description)
    expect(content.timeFrom).toBe(update.timeFrom)
    expect(content.timeTo).toBe(update.timeTo)
    expect(content.project._id).toBe(update.project)
    expect(content.recipient._id).toBe(update.recipient)

    activity.title = content.title
    activity.description = content.description
    activity.timeFrom = content.timeFrom
    activity.timeTo = content.timeTo
    activity.project._id = content.project
    activity.recipient._id = content.recipient
  })

  it('Should paginate activities', async () => {
    let response, content

    response = await client.get('/activities/?perPage=2&page=1')
    content = await response.json()

    expect(content.length).toBe(2)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/activities/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(2)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/activities/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(2)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should find activities by title', async () => {
    const activity = activities.find(({ title }) => title === 'Updated title')
    const response = await client.get('/activities/?title=Updated')
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by project', async () => {
    const activity = activities[pickRandom(0, activities.length - 1)]
    const project = activity.project
    const response = await client.get(`/activities/?project=${project}`)
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by recipient', async () => {
    const activity = activities[pickRandom(0, activities.length - 1)]
    const recipient = activity.recipient
    const response = await client.get(`/activities/?recipient=${recipient}`)
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by people', async () => {
    const activity = activities.find(a => a.people && a.people.length)
    const person = activity.people[0]
    const response = await client.get(`/activities/?people[]=${person}`)
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by time before', async () => {
    const before = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
    const check = activities.find(({ timeTo }) => new Date(timeTo) < new Date(before))
    const response = await client.get(`/activities/?before=${before}`)
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining({
      _id: check._id
    }))
  })

  it('Should find activities by time after', async () => {
    const after = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
    const check = activities.find(({ timeFrom }) => new Date(timeFrom) > new Date(after))
    const response = await client.get(`/activities/?after=${after}`)
    const content = await response.json()

    expect(content).toContainEqual(expect.objectContaining({
      _id: check._id
    }))
  })

  it('Should return a single activity', async () => {
    const activity = activities[pickRandom(0, activities.length - 1)]
    const response = await client.get(`/activities/${activity._id}/`)
    const content = await response.json()

    expect(content._id).toBe(activity._id)
  })

  it('Should remove people', async () => {
    const activity = activities.find(a => a.people && a.people.length)
    const person = activity.people[0]

    const response = await client.delete(`/activities/${activity._id}/people/`, {
      body: {
        people: [person]
      }
    })
    const content = await response.json()

    expect(content.people).toEqual([])
  })

  it(
    'Should be impossible to access an activity for users not assigned to the project',
    async () => {
      let response, content
      const activity = activities[0]
      const project = activity.project

      await client.delete(`/projects/${project}/people/`, {
        body: {
          people: [{ _id: makerUser._id }]
        }
      })

      await client.post('/users/login/', {
        body: {
          email: makerUser.email,
          password: makerUser.password,
          passwordConfirmation: makerUser.password
        }
      })

      response = await client.get('/activities/')
      content = await response.json()
      expect(content).not.toContainEqual(expect.objectContaining({ _id: activity._id }))

      response = await client.get(`/activities/${activity._id}/`)
      expect(response.status).toBe(401)

      response = await client.put(`/activities/${activity._id}/`)
      expect(response.status).toBe(401)

      response = await client.delete(`/activities/${activity._id}/`)
      expect(response.status).toBe(401)

      await client.login()
    }
  )

  it('Should delete activities', async () => {
    await Promise.all(activities.map(async activity => {
      const response = await client.delete(`/activities/${activity._id}/`)
      expect(response.status).toBe(200)
    }))
  })
})
