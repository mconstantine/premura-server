const Client = require('./client')
const App = require('./app')
const teardown = require('./single-teardown')

describe('user', async () => {
  afterAll(teardown)

  const client = new Client('http://localhost:3000')
  const app = new App(client)
  const users = []

  beforeAll(async () => {
    await client.login()

    for (let i = 0; i < 3; i++) {
      const user = await app.createUser()
      users.push(user)
    }
  })

  it('Should paginate users', async () => {
    let response, content

    response = await client.get('/users/?perPage=1&page=1')
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe((users.length + 1).toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/users/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe((users.length + 1).toString())
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/users/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(1)
    expect(response.headers.get('X-Pages-Count')).toBe((users.length + 1).toString())
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  it('Should return single users', async () => {
    const user = users[0]
    const response = await client.get(`/users/${user._id}`)
    const content = await response.json()

    expect(content).toEqual({
      _id: user._id,
      name: user.name,
      role: user.role,
      jobRole: user.jobRole,
      isActive: user.isActive,
      lang: user.lang,
      lastUpdateDate: expect.any(String)
    })

    expect(() => user.lastUpdateDate = new Date(content.lastUpdateDate)).not.toThrow()
    expect(user.lastUpdateDate).toBeInstanceOf(Date)
  })

  it('Should correctly update a user (master updates user)', async () => {
    let response
    let user = users[1]
    const lastUpdateDate = new Date()

    const update = {
      email: 'masterupdate@example.com',
      role: 'maker',
      password: 'masterupdate',
      passwordConfirmation: 'masterupdate',
      lang: 'it'
    }

    response = await client.put(`/users/${user._id}`, update, true)

    expect(response._id).toBe(user._id)
    expect(response.role).toEqual(update.role)
    expect(response.lang).toEqual(update.lang)
    expect(new Date(response.lastUpdateDate).getTime()).toBeGreaterThan(lastUpdateDate.getTime())

    response = await client.post('/users/login/', {
      email: update.email,
      password: update.password,
      lang: update.lang
    }, true)

    users[1] = Object.assign(users[1], update)
    user = users[1]

    expect(response).toEqual({
      _id: user._id,
      name: user.name,
      role: user.role,
      jobRole: user.jobRole,
      isActive: user.isActive,
      lang: user.lang,
      lastUpdateDate: expect.any(String)
    })

    expect(() => user.lastUpdateDate = new Date(response.lastUpdateDate)).not.toThrow()
    expect(user.lastUpdateDate).toBeInstanceOf(Date)

    await client.login()
  })

  it('Should correctly update a user (same user)', async () => {
    let response
    let user = users[2]
    const lastUpdateDate = new Date()

    response = await client.post('/users/login/', {
      email: user.email,
      password: user.password,
      lang: user.lang
    })

    expect(response.status).toBe(200)

    const update = {
      name: 'User Update',
      email: 'userupdate@example.com',
      password: 'userupdate',
      passwordConfirmation: 'userupdate',
      jobRole: 'User Update',
      lang: 'it'
    }

    await client.put(`/users/${user._id}`, update)

    response = await client.get(`/users/${user._id}`)
    expect(response.status).toBe(401) // Should have been logged out

    response = await client.post('/users/login/', {
      email: update.email,
      password: update.password,
      lang: update.lang
    }, true)

    users[2] = Object.assign(users[2], update)
    user = users[2]

    expect(response).toEqual({
      _id: user._id,
      name: user.name,
      role: user.role,
      jobRole: user.jobRole,
      isActive: user.isActive,
      lang: user.lang,
      lastUpdateDate: expect.any(String)
    })

    expect(() => user.lastUpdateDate = new Date(response.lastUpdateDate)).not.toThrow()
    expect(user.lastUpdateDate).toBeInstanceOf(Date)
    expect(user.lastUpdateDate.getTime()).toBeGreaterThan(lastUpdateDate.getTime())

    await client.login()
  })

  it('Should find users by name', async () => {
    const target = client.getUser()
    const name = target.name
    const response = await client.get(`/users/?name=${name}`, undefined, true)
    const user = response.find(
      user => user.name === target.name
    )

    expect(response.length).toBeLessThan(users.length + 1)
    expect(user).toBeTruthy()
  })

  it('Should find users by jobRole', async () => {
    const target = client.getUser()
    const jobRole = target.jobRole
    const response = await client.get(`/users/?jobRole=${jobRole}`, undefined, true)
    const user = response.find(
      user => user.jobRole === target.jobRole
    )

    expect(response.length).toBeLessThan(users.length + 1)
    expect(user).toBeTruthy()
  })

  it('Should get job roles', async () => {
    const response = await client.get('/users/roles/', undefined, true)

    users.concat([client.getUser()]).forEach(({ jobRole }) => {
      expect(response).toContain(jobRole)
    })
  })

  it('Should delete a project if a user is deleted', async () => {
    const user = await app.createUser()
    const project = await app.createProject()

    await client.post(`/projects/${project._id}/people/`, {
      people: [{
        _id: user._id
      }]
    })

    await client.delete(`/projects/${project._id}/people/`, {
      people: [{
        _id: client.getUser()._id
      }]
    })

    await client.delete(`/users/${user._id}`)

    const response = await client.get(`/projects/${project._id}/`)
    expect(response.status).toBe(404)
  })

  it('Should delete an activity if a user is deleted', async () => {
    const user = await app.createUser()
    const project = await app.createProject()
    const activity = await app.createActivity(user._id, project._id)

    await client.delete(`/users/${user._id}/`)

    const response = await client.get(`/activities/${activity._id}/`)
    expect(response.status).toBe(404)
  })
})
