const bcrypt = require('bcryptjs')
const { isEmail } = require('validator')
const trim = require('../misc/trim')
const createError = require('../misc/createServerError')
const roles = require('../misc/roles')
const getDb = require('../misc/getDb')
const { ObjectID } = require('mongodb')
const cursorify = require('../misc/cursorify')
const find = require('../misc/find')

const router = require('express').Router()
const endpoint = require('./endpoint')
const loginGate = require('../misc/loginGate')
const makeCreateUser = require('./make-createUser')
const makeGetUsers = require('./make-getUsers')
const makeGetUser = require('./make-getUser')
const makeFindUsers = require('./make-findUsers')
const makeUpdateUser = require('./make-updateUser')
const makeDeleteUser = require('./make-deleteUser')
const makeLogin = require('./make-login')
const logout = require('./logout')

module.exports = endpoint({
  router,
  loginGate,
  createUser: makeCreateUser({ bcrypt, isEmail, trim, createError, roles, getDb }),
  getUsers: makeGetUsers({ getDb, cursorify }),
  getUser: makeGetUser({ getDb, createError, ObjectID }),
  findUsers: makeFindUsers({ createError, getDb, find }),
  updateUser: makeUpdateUser({ createError, ObjectID, getDb, roles, trim, bcrypt, isEmail }),
  deleteUser: makeDeleteUser({ createError, ObjectID, getDb, roles }),
  login: makeLogin({ bcrypt, createError, trim, getDb }),
  logout
})
