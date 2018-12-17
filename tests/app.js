const faker = require('faker')
const pickRandom = require('../misc/pickRandom')
const status = require('../misc/status')

module.exports = class App {
  constructor(client) {
    this.client = client
  }

  async createUser(props = {}) {
    const user = Object.assign({
      name: faker.name.firstName() + ' ' + faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: pickRandom(['manager', 'maker']),
      jobRole: faker.lorem.word(),
      isActive: true,
      lang: 'en'
    }, props)

    const result = await this.client.post('/users/', Object.assign({}, user, {
      passwordConfirmation: user.password
    }), true)

    return Object.assign(user, result)
  }

  async createProject(props = {}) {
    const project = Object.assign({
      name: faker.lorem.words(pickRandom(1, 4)),
      description: faker.lorem.words(pickRandom(2, 30)),
      budget: pickRandom(8, 100),
      status: pickRandom(status)
    }, props)

    const response = await this.client.post('/projects/', project)
    const result = await response.json()

    return Object.assign(project, result)
  }

  async createActivity(recipient, project, props = {}) {
    const activity = Object.assign({
      title: faker.lorem.words(pickRandom(3, 8)),
      recipient,
      project,
      timeFrom: new Date(Date.now()).toISOString(),
      timeTo: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    }, props)

    // Assign the recipient to the project
    await this.client.post(`/projects/${project}/people/`, {
      people: [{ _id: recipient }]
    })

    const response = await this.client.post('/activities/', activity)
    const result = await response.json()

    return Object.assign(activity, result)
  }

  async createCategory(props = {}) {
    const category = Object.assign({
      name: faker.lorem.words(pickRandom(1, 3)),
      description: faker.lorem.words(pickRandom(5, 30)),
      allowsMultipleTerms: pickRandom()
    }, props)

    const response = await this.client.post('/categories/', category)
    const result = await response.json()

    return Object.assign(category, result)
  }

  createTerm() {
    return {
      name: faker.lorem.words(pickRandom(1, 2))
    }
  }
}
