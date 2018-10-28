const bcrypt = require('bcryptjs')
const { isEmail } = require('validator')
const trim = require('../misc/trim')
const createError = require('../misc/createServerError')
const roles = require('../misc/roles')
const getDb = require('../misc/getDb')
const ObjectID = require('mongodb').ObjectID

const router = require('express').Router()
const endpoint = require('./endpoint')
const loginGate = require('../misc/loginGate')
const makeCreateUser = require('./make-createUser')
const getUsers = require('./getUsers')
const getUser = require('./getUser')
const updateUser = require('./updateUser')
const makeDeleteUser = require('./make-deleteUser')
const makeLogin = require('./make-login')
const logout = require('./logout')

module.exports = endpoint({
  router,
  loginGate,
  createUser: makeCreateUser({ bcrypt, isEmail, trim, createError, roles, getDb }),
  getUsers,
  getUser,
  updateUser,
  deleteUser: makeDeleteUser({ createError, ObjectID, getDb, roles }),
  login: makeLogin({ bcrypt, createError, trim, getDb }),
  logout
})
