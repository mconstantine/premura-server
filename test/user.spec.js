const client = require('./getClient')('http://localhost:3000')
const faker = require('faker')
const roles = require('../misc/roles')
const pickRandom = require('../misc/pickRandom')

describe('user', () => {
  let ids = []

  it('Should create users', async () => {
    for (let i = 0; i < 10; i++) {
      const password = faker.internet.password()

      const response = await client.post('/users/', {
        body: {
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          password,
          passwordConfirmation: password,
          role: roles[pickRandom(0, roles.length - 2)],
          jobRole: 'Example'
        }
      })

      const content = await response.json()
      expect(content).toMatchObject({ _id: expect.any(String) })

      ids.push(content._id)
    }
  })

  it('Should paginate users', async () => {
    let response, content

    response = await client.get('/users/?perPage=5&page=1')
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get('/users/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get('/users/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  let exampleUser

  it('Should return single users', async () => {
    const _id = pickRandom(ids)
    const response = await client.get(`/users/${_id}`)
    const content = await response.json()

    expect(content).toBeInstanceOf(Object)

    exampleUser = content
  })

  it('Should correctly update a user (master updates user)', async () => {
    let response, content
    const lastUpdateDate = new Date()

    const update = {
      email: 'masterupdate@example.com',
      role: 'maker',
      password: 'masterupdate',
      passwordConfirmation: 'masterupdate'
    }

    response = await client.put(`/users/${exampleUser._id}`, {
      body: update
    })
    content = await response.json()

    expect(content.role).toEqual(update.role)
    expect(new Date(content.lastUpdateDate).getTime())
    .toBeGreaterThan(lastUpdateDate.getTime())

    response = await client.post('/users/login/', {
      body: {
        email: update.email,
        password: update.password
      }
    })

    expect(response.status).toBe(200)
  })

  it('Should correctly update a user (same user)', async () => {
    let response, content
    const lastUpdateDate = new Date()

    response = await client.post('/users/login/', {
      body: {
        email: 'masterupdate@example.com',
        password: 'masterupdate'
      }
    })

    expect(response.status).toBe(200)

    const update = {
      name: 'User Update',
      email: 'userupdate@example.com',
      password: 'userupdate',
      passwordConfirmation: 'userupdate',
      jobRole: 'User Update'
    }

    await client.put(`/users/${exampleUser._id}`, {
      body: update
    })

    response = await client.get(`/users/${exampleUser._id}`)
    expect(response.status).toBe(401) // Should have been logged out

    response = await client.post('/users/login/', {
      body: {
        email: update.email,
        password: update.password
      }
    })

    expect(response.status).toBe(200)
    content = await response.json()
    expect(content.name).toBe(update.name)
    expect(content.jobRole).toBe(update.jobRole)
    expect(new Date(content.lastUpdateDate).getTime())
    .toBeGreaterThan(lastUpdateDate.getTime())
  })

  it('Should find users', async () => {
    const response = await client.get('/users/?name=User&jobRole=User')
    const content = await response.json()
    const user = content.find(
      user => user.name === 'User Update' && user.jobRole === 'User Update'
    )

    expect(user).toBeTruthy()
  })

  it('Should get job roles', async () => {
    const response = await client.get('/users/roles/')
    const content = await response.json()

    expect(content.length).toBe(3)
    expect(content).toContain('Master')
    expect(content).toContain('Example')
    expect(content).toContain('User Update')
  })

  it('Should delete a project if a user is deleted', async () => {
    const userId = await client.login()
    let response, content

    response = await client.post('/projects', {
      body: {
        name: 'A project'
      }
    })
    content = await response.json()

    const projectId = content._id

    response = await client.post(`/projects/${projectId}/people/`, {
      body : {
        people: [{
          _id: exampleUser._id
        }]
      }
    })

    await client.delete(`/projects/${projectId}/people/`, {
      body: {
        people: [{
          _id: userId
        }]
      }
    })

    await client.delete(`/users/${exampleUser._id}`)

    response = await client.get(`/projects/${projectId}`)
    expect(response.status).toBe(404)

    ids = ids.filter(_id => _id !== exampleUser._id.toString())
    await client.delete(`/projects/${projectId}`)
  })

  it('Should delete users', async () => {
    await client.login()

    for (_id of ids) {
      const response = await client.delete(`/users/${_id}`)
      expect(response.status).toBe(200)
    }
  })
})
