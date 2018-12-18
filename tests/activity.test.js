const Client = require('./client')
const App = require('./app')
const teardown = require('./single-teardown')

describe('activity', () => {
  afterAll(teardown)

  const client = new Client('http://localhost:3000')
  const app = new App(client)
  const activities = []
  let project

  beforeAll(async () => {
    await client.login()
    const currentUserId = client.getUser()._id
    project = await app.createProject({ budget: 0 })

    for (let i = 0; i < 8; i++) {
      const activity = await app.createActivity(currentUserId, project._id)
      activities.push(activity)
    }
  })

  it('Should look for people in recipient when searching', async () => {
    const activity = activities[0]
    const response = await client.get(`/activities/?people[]=${activity.recipient}`, undefined, true)

    expect(response).toContainEqual(expect.objectContaining({ _id: activity._id }))
  })

  it('Should add people', async () => {
    const activity = activities[1]
    const user = await app.createUser()

    await client.post(`/projects/${project._id}/people/`, {
      people: [{ _id: user._id }]
    })

    const response = await client.post(`/activities/${activity._id}/people/`, {
      people: [user._id]
    }, true)

    expect(response.people).toContainEqual(expect.objectContaining({ _id: user._id }))
  })

  it('Should update activities', async () => {
    const activity = activities[2]
    const project = await app.createProject()
    const user = await app.createUser()

    await client.post(`/projects/${project._id}/people/`, {
      people: [{ _id: user._id }]
    })

    const update = {
      title: 'Updated title',
      description: 'Updated description',
      project: project._id,
      recipient: user._id,
      timeFrom: new Date(new Date(activity.timeFrom).getTime() + 1000).toISOString(),
      timeTo: new Date(new Date(activity.timeTo).getTime() + 1000).toISOString()
    }

    const response = await client.put(`/activities/${activity._id}/`, update, true)

    expect(response.title).toBe(update.title)
    expect(response.description).toBe(update.description)
    expect(response.timeFrom).toBe(update.timeFrom)
    expect(response.timeTo).toBe(update.timeTo)
    expect(response.project._id).toBe(update.project)
    expect(response.recipient._id).toBe(update.recipient)
  })

  it('Should paginate activities', async () => {
    let response, content

    response = await client.get('/activities/?perPage=1&page=1')
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(activities.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/activities/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(activities.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/activities/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(activities.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should find activities by title', async () => {
    const activity = activities[3]
    const response = await client.get(
      `/activities/?title=${activity.title.split(' ')[0]}`,
      undefined,
      true
    )

    expect(response).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by project', async () => {
    const activity = activities[3]
    const project = await app.createProject()

    await client.put(`/activities/${activity._id}/`, {
      project: project._id
    })

    const response = await client.get(`/activities/?project=${project._id}`, undefined, true)

    expect(response).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by recipient', async () => {
    const activity = activities[4]
    const user = await app.createUser()

    await client.post(`/projects/${activity.project}/people/`, {
      people: [{ _id: user._id }]
    })

    await client.put(`/activities/${activity._id}/`, {
      recipient: user._id
    })

    const response = await client.get(`/activities/?recipient=${user._id}`, undefined, true)

    expect(response).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by people', async () => {
    const activity = activities[5]
    const user = await app.createUser()

    await client.post(`/projects/${activity.project}/people/`, {
      people: [{ _id: user._id }]
    })

    await client.post(`/activities/${activity._id}/people/`, {
      people: [user._id]
    })

    const response = await client.get(`/activities/?people[]=${user._id}`, undefined, true)

    expect(response).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by time before', async () => {
    let response
    const activity = activities[6]
    const before = new Date(Date.now() + 1000 * 60 * 60 * 24 * 98).toISOString()
    const timeFrom = new Date(Date.now() + 1000 * 60 * 60 * 24 * 99).toISOString()
    const timeTo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 100).toISOString()
    const after = new Date(Date.now() + 1000 * 60 * 60 * 24 * 101).toISOString()

    response = await client.put(`/activities/${activity._id}/`, { timeFrom, timeTo }, true)

    response = await client.get(`/activities/?before=${before}`, undefined, true)
    expect(response).not.toContainEqual(expect.objectContaining({
      _id: activity._id
    }))

    response = await client.get(`/activities/?before=${after}`, undefined, true)
    expect(response).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should find activities by time after', async () => {
    let response
    const activity = activities[6]
    const before = new Date(Date.now() + 1000 * 60 * 60 * 24 * 98).toISOString()
    const timeFrom = new Date(Date.now() + 1000 * 60 * 60 * 24 * 99).toISOString()
    const timeTo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 100).toISOString()
    const after = new Date(Date.now() + 1000 * 60 * 60 * 24 * 101).toISOString()

    response = await client.put(`/activities/${activity._id}/`, { timeFrom, timeTo }, true)

    response = await client.get(`/activities/?after=${after}`, undefined, true)
    expect(response).not.toContainEqual(expect.objectContaining({
      _id: activity._id
    }))

    response = await client.get(`/activities/?after=${before}`, undefined, true)
    expect(response).toContainEqual(expect.objectContaining({
      _id: activity._id
    }))
  })

  it('Should return a single activity', async () => {
    const activity = activities[0]
    const response = await client.get(`/activities/${activity._id}/`, undefined, true)

    expect(response._id).toBe(activity._id)
  })

  it('Should remove people', async () => {
    const activity = activities[6]
    const users = [
      await app.createUser(),
      await app.createUser(),
      await app.createUser()
    ]

    await client.post(`/projects/${activity.project}/people/`, {
      people: users.map(({ _id }) => ({ _id }))
    })

    await client.post(`/activities/${activity._id}/people/`, {
      people: users.map(({ _id }) => _id)
    })

    const response = await client.delete(`/activities/${activity._id}/people/`, {
      people: [users[1]._id]
    }, true)

    expect(response.people).toContainEqual(
      expect.objectContaining({ _id: users[0]._id }),
      expect.objectContaining({ _id: users[1]._id })
    )
  })

  it('Should be impossible to access an activity for users not assigned to the project', async () => {
    let response
    const activity = activities[0]
    const user = await app.createUser()

    response = await client.post('/users/login/', {
      email: user.email,
      password: user.password,
      lang: user.lang
    }, true)

    response = await client.get('/activities/', undefined, true)
    expect(response).not.toContainEqual(expect.objectContaining({ _id: activity._id }))

    response = await client.put(`/activities/${activity._id}/`)
    expect(response.status).toBe(401)

    response = await client.delete(`/activities/${activity._id}/`)
    expect(response.status).toBe(401)

    await client.login()
  })

  it('Should delete activities', async () => {
    const activity = activities[7]
    await client.delete(`/activities/${activity._id}/`)
    const response = await client.get(`/activities/${activity._id}/`, undefined)
    expect(response.status).toBe(404)
  })
})
