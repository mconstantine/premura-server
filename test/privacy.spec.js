/*
This tests that a user can create it's own project and no one else can see it
*/
const client = require('./getClient')('http://localhost:3000')
const { ObjectID } = require('mongodb')

describe('privacy', () => {
  it('Should do it', async () => {
    let response, content

    const user = {
      name: 'Some User',
      email: 'some-user@example.com',
      password: 'supersecret',
      role: 'maker',
      jobRole: 'Example'
    }

    // Master is logged in
    response = await client.post('/users/', {
      body: Object.assign({}, user, {
        passwordConfirmation: user.password
      })
    })
    content = await response.json()

    if (response.status !== 201) {
      console.log(content)
    }

    expect(response.status).toBe(201)
    user._id = content._id


    // Maker is logged in
    await client.post('/users/login/', {
      body: {
        email: user.email,
        password: user.password
      }
    })

    const project = {
      name: 'My project',
      description: 'A project that only I can see.'
    }

    response = await client.post('/projects/', {
      body: project
    })
    content = await response.json()
    project._id = content._id

    const now = Date.now()
    const activities = [{
      title: 'First activity',
      recipient: user._id,
      project: project._id,
      timeFrom: new Date(now + 1000 * 60 * 60 * 24 * 1),
      timeTo: new Date(now + 1000 * 60 * 60 * 24 * 1 + 1000 * 60 * 60)
    }, {
      title: 'Second activity',
      recipient: user._id,
      project: project._id,
      timeFrom: new Date(now + 1000 * 60 * 60 * 24 * 2),
      timeTo: new Date(now + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60)
    }, {
      title: 'Third activity',
      recipient: user._id,
      project: project._id,
      timeFrom: new Date(now + 1000 * 60 * 60 * 24 * 3),
      timeTo: new Date(now + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60)
    }]

    await Promise.all(activities.map(async activity => {
      const response = await client.post('/activities/', {
        body: activity
      })
      const content = await response.json()
      activity._id = content._id
    }))

    // Master is logged in
    await client.login()
    const currentUser = client.getCurrentUser()

    response = await client.get('/projects/')
    content = await response.json()
    expect(content).not.toContain(expect.objectContaining({ _id: project._id }))

    response = await client.get(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    response = await client.post(`/projects/${project._id}/deadlines/`, {
      body: { deadlines: [new Date().toISOString()] }
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/deadlines/`, {
      body: { deadlines: [new Date().toISOString()] }
    })
    expect(response.status).toBe(401)

    response = await client.post(`/projects/${project._id}/people/`, {
      body: { people: [{ _id: currentUser._id }] }
    })
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/people/`, {
      body: { people: [{ _id: currentUser._id }] }
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/people/`, {
      body: { people: [{ _id: user._id }] }
    })
    expect(response.status).toBe(401)

    const randomId = new ObjectID()

    response = await client.post(`/projects/${project._id}/terms/`, {
      body: { terms: [randomId] }
    })
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/terms/`, {
      body: { destination: randomId }
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/terms/`, {
      body: { terms: [randomId] }
    })
    expect(response.status).toBe(401)
  })

  afterAll(async () => {
    // This deletes the project and the activities as well
    await client.delete(`/users/${user._id}/`)
  })
})
