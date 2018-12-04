const fetch = require('node-fetch')
let client

module.exports = apiUrl => {
  client = client || new Client(apiUrl)
  return client
}

class Client {
  constructor(apiUrl) {
    this.apiUrl = apiUrl
  }

  async login() {
    const response = await fetch(this.apiUrl + '/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'root@premura.com',
        password: 'root'
      })
    })
    const content = await response.json()

    this.cookie = response.headers.get('set-cookie')
    this.currentUser = content

    return content._id
  }

  getCurrentUser() {
    return this.currentUser
  }

  async get(url, options = {}) {
    return this.fetch(url, 'GET', options)
  }

  async post(url, options = {}) {
    return this.fetch(url, 'POST', options)
  }

  async put(url, options = {}) {
    return this.fetch(url, 'PUT', options)
  }

  async delete(url, options = {}) {
    return this.fetch(url, 'DELETE', options)
  }

  async fetch(url, method, options = {}) {
    if (!this.cookie) {
      await this.login()
    }

    const httpOptions = {
      method,
      headers: {
        cookie: this.cookie,
        'Content-Type': 'application/json'
      }
    }

    if (options.headers) {
      httpOptions.headers = Object.assign(httpOptions.headers, options.headers)
    }

    if (options.body) {
      httpOptions.body = JSON.stringify(options.body)
    }

    return await fetch(this.apiUrl + url, httpOptions)
  }
}
