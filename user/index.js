const router = require('express').Router()
const endpoint = require('./endpoint')
const loginGate = require('../misc/loginGate')
const createUser = require('./createUser')
const getUsers = require('./getUsers')
const getUser = require('./getUser')
const updateUser = require('./updateUser')
const deleteUser = require('./deleteUser')
const login = require('./login')
const logout = require('./logout')

module.exports = endpoint({
  router,
  loginGate,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  login,
  logout
})()
