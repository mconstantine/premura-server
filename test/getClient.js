const fetch = require('node-fetch')
let client

module.exports = () => {
  client = client || new Client()
  return client
}

class Client {
  async login() {
    const response = await fetch('http://localhost:3000/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'root@premura.com',
        password: 'root'
      })
    })

    this.cookie = response.headers.get('set-cookie')
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

    return await fetch(url, httpOptions)
  }
}
