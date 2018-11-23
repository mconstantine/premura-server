const API_URL = 'http://localhost:3000'

const config = require('./config')
const app = require('../make-app')({ config })
const { setup, teardown } = require('./init')
const client = require('./getClient')()
const faker = require('faker')
const roles = require('../misc/roles')

let server

beforeAll(async () => {
  server = await app.listen(3000)
  await setup()
})

afterAll(async () => {
  await teardown()
  server.close()
})

describe('user', () => {
  const ids = []

  it('Should create users', async () => {
    for (let i = 0; i < 10; i++) {
      const password = faker.internet.password()

      const response = await client.post(API_URL + '/users/', {
        body: {
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          password,
          passwordConfirmation: password,
          role: roles[Math.round(Math.random() * (roles.length - 2))],
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

    response = await client.get(API_URL + '/users/?perPage=5&page=1')
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')

    response = await client.get(API_URL + '/users/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Next-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('2')

    response = await client.get(API_URL + '/users/', {
      headers: {
        'X-Page-Cursor': response.headers.get('X-Prev-Page-Cursor')
      }
    })
    content = await response.json()

    expect(content.length).toBe(5)
    expect(response.headers.get('X-Pages-Count')).toBe('3')
    expect(response.headers.get('X-Current-Page')).toBe('1')
  })

  let user

  it('Should return single users', async () => {
    const _id = ids[Math.round(Math.random() * (ids.length - 1))]
    const response = await client.get(API_URL + `/users/${_id}`)
    const content = await response.json()

    expect(content).toBeInstanceOf(Object)

    user = content
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

    response = await client.put(API_URL + `/users/${user._id}`, {
      body: update
    })
    content = await response.json()

    expect(content.role).toEqual(update.role)
    expect(new Date(content.lastUpdateDate).getTime())
    .toBeGreaterThan(lastUpdateDate.getTime())

    response = await client.post(API_URL + '/users/login/', {
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

    response = await client.post(API_URL + '/users/login/', {
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

    await client.put(API_URL + `/users/${user._id}`, {
      body: update
    })

    response = await client.get(API_URL + `/users/${user._id}`)
    expect(response.status).toBe(401) // Should have been logged out

    response = await client.post(API_URL + '/users/login/', {
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
    const response = await client.get(API_URL + '/users/?name=User&jobRole=User')
    const content = await response.json()
    const user = content.find(
      user => user.name === 'User Update' && user.jobRole === 'User Update'
    )

    expect(user).toBeTruthy()
  })

  it('Should get job roles', async () => {
    const response = await client.get(API_URL + '/users/roles/')
    const content = await response.json()

    expect(content).toEqual(['Master', 'Example', 'User Update'])
  })

  it('Should delete users', async () => {
    await client.login()

    for (_id of ids) {
      const response = await client.delete(`http://localhost:3000/users/${_id}`)

      expect(response.status).toBe(200)
    }
  })
})
