const fetch = require('node-fetch')

module.exports = class Client {
  constructor(apiUrl) {
    this.apiUrl = apiUrl
    this.user = {
      name: 'Root User',
      email: 'root@premura.com',
      password: 'supersecret',
      role: 'master',
      jobRole: 'Boss',
      isActive: true,
      lang: 'en'
    }
  }

  getUser() {
    return this.user
  }

  async login() {
    const response = await this.post('/users/login/', {
      email: this.user.email,
      password: this.user.password,
      lang: this.user.lang
    })

    const content = await response.json()
    this.cookie = response.headers.get('set-cookie')
    this.user._id = content._id
  }

  async get(url, data, shouldReturnContent) {
    return this.sendRequest('GET', url, data, shouldReturnContent)
  }

  async post(url, data, shouldReturnContent) {
    return this.sendRequest('POST', url, { body: data }, shouldReturnContent)
  }

  async put(url, data, shouldReturnContent) {
    return this.sendRequest('PUT', url, { body: data }, shouldReturnContent)
  }

  async delete(url, data, shouldReturnContent) {
    return this.sendRequest('DELETE', url, { body: data }, shouldReturnContent)
  }

  async sendRequest(method, url, httpOptions = {}, shouldReturnContent) {
    httpOptions.method = method
    httpOptions.headers = httpOptions.headers || {}
    httpOptions.headers['Content-Type'] = 'application/json'

    if (this.cookie) {
      httpOptions.headers.cookie = this.cookie
    }

    if (httpOptions.body && Object.keys(httpOptions.body)) {
      httpOptions.body = JSON.stringify(httpOptions.body)
    }

    const response = fetch(this.apiUrl + url, httpOptions)

    if (!shouldReturnContent) {
      return response
    }

    const content = await response

    if (response.status > 299) {
      const text = await content.text()
      console.log(text)
      return text
    }

    return content.json()
  }
}
