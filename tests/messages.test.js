const Client = require('./client')
const App = require('./app')
const teardown = require('./single-teardown')
const faker = require('faker')
const pickRandom = require('../misc/pickRandom')

describe('messages', () => {
  afterAll(teardown)

  const client = new Client('http://localhost:3000')
  const app = new App(client)
  const messages = []
  let project

  const createMessage = () => ({
    content: faker.lorem.words(pickRandom(10, 30))
  })

  beforeAll(async () => {
    await client.login()
    project = await app.createProject()

    for (let i = 0; i < 3; i++) {
      const message = createMessage()
      const { _id } = await client.post(`/projects/${project._id}/messages/`, message, true)
      messages.push(Object.assign(message, { _id }))
    }
  })

  it('Should paginate messages', async () => {
    let response, content

    response = await client.get(`/projects/${project._id}/messages/?perPage=1&page=1`)
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(messages.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get(`/projects/${project._id}/messages/`, {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(messages.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get(`/projects/${project._id}/messages/`, {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe(messages.length.toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should find messages by content', async () => {
    const message = messages[0]
    const content = message.content.split(' ').slice(0, 10).join(' ')
    const response = await client.get(
      `/projects/${project._id}/messages/?content=` + content,
      undefined,
      true
    )

    expect(response).toContainEqual(expect.objectContaining({
      _id: message._id
    }))
  })

  it('Should update messages', async () => {
    const message = messages[1]
    const update = { content: 'Updated content' }
    const response = await client.put(`/projects/${project._id}/messages/${message._id}/`, update, true)

    expect(response.content).toBe(update.content)
  })

  it('Should delete messages', async () => {
    const message = messages[2]
    await client.delete(`/projects/${project._id}/messages/${message._id}/`)
    const response = await client.get(`/projects/${project._id}/messages/`, undefined, true)
    expect(response).not.toContainEqual(expect.objectContaining({ _id: message._id }))
  })
})
