/*
This tests that a user can create it's own project and no one else can see it
*/
const { ObjectID } = require('mongodb')
const Client = require('./client')
const App = require('./app')
const teardown = require('./single-teardown')

describe('privacy', () => {
  afterAll(teardown)

  const client = new Client('http://localhost:3000')
  const app = new App(client)

  beforeAll(async () => {
    await client.login()
  })

  it('Should do it', async () => {
    let response
    const user = await app.createUser()

    // Maker log in
    await client.post('/users/login/', {
      email: user.email,
      password: user.password,
      lang: user.lang
    })

    const project = await app.createProject()
    const activities = []

    for (let i = 0; i < 3; i++) {
      activities.push(await app.createActivity(user._id, project._id))
    }

    const messageId = (
      await client.post(`/projects/${project._id}/messages/`, {
        content: 'A message'
      }, true)
    )._id

    // Master log in
    await client.login()

    response = await client.get('/projects/', undefined, true)
    expect(response).not.toContain(expect.objectContaining({ _id: project._id }))

    response = await client.get(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/`)
    expect(response.status).toBe(401)

    response = await client.post(`/projects/${project._id}/deadlines/`, {
      deadlines: [new Date().toISOString()]
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/deadlines/`, {
      deadlines: [new Date().toISOString()]
    })
    expect(response.status).toBe(401)

    response = await client.post(`/projects/${project._id}/people/`, {
      people: [{ _id: client.getUser()._id }]
    })
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/people/`, {
      people: [{ _id: client.getUser()._id }]
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/people/`, {
      people: [{ _id: user._id }]
    })
    expect(response.status).toBe(401)

    const randomId = new ObjectID()

    response = await client.post(`/projects/${project._id}/terms/`, {
      terms: [randomId]
    })
    expect(response.status).toBe(401)

    response = await client.get(`/projects/${project._id}/messages/`, undefined, true)
    expect(response.length).toBe(0)

    response = await client.post(`/projects/${project._id}/messages/`, {
      content: 'Hello'
    })
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/messages/${messageId}/`, {
      content: 'Hello'
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/messages/${messageId}/`)
    expect(response.status).toBe(401)

    response = await client.put(`/projects/${project._id}/terms/`, {
      destination: randomId
    })
    expect(response.status).toBe(401)

    response = await client.delete(`/projects/${project._id}/terms/`, {
      terms: [randomId]
    })
    expect(response.status).toBe(401)
  })
})
