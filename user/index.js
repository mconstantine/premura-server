const bcrypt = require('bcryptjs')
const { isEmail } = require('validator')
const trim = require('../misc/trim')
const createError = require('../misc/createServerError')
const roles = require('../misc/roles')
const getDb = require('../misc/get-db')

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
  createUser: createUser({ bcrypt, isEmail, trim, createError, roles, getDb }),
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  login: login({ bcrypt, createError, trim, getDb }),
  logout
})
