const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const createError = require('../misc/createServerError')
const roles = require('../misc/roles')
const getDb = require('../misc/getDb')
const { ObjectID } = require('mongodb')
const cursorify = require('../misc/cursorify')
const find = require('../misc/find')

const makeSendValidation = require('../misc/make-sendValidation')
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

const makeValidateLogin = require('./make-validateLogin')
const makeValidateCreateUser = require('./make-validateCreateUser')
const makeValidateUpdateUser = require('./make-validateUpdateUser')

module.exports = endpoint({
  router,
  loginGate,
  createUser: makeCreateUser({ bcrypt, createError, roles, getDb }),
  getUsers: makeGetUsers({ getDb, cursorify }),
  getUser: makeGetUser({ getDb, createError, ObjectID }),
  findUsers: makeFindUsers({ getDb, find }),
  updateUser: makeUpdateUser({ createError, ObjectID, getDb, roles, bcrypt }),
  deleteUser: makeDeleteUser({ createError, ObjectID, getDb, roles }),
  login: makeLogin({ bcrypt, createError, getDb }),
  logout,
  sendValidation: makeSendValidation({ validationResult }),
  validateLogin: makeValidateLogin({ check }),
  validateCreateUser: makeValidateCreateUser({ check, roles }),
  validateUpdateUser: makeValidateUpdateUser({ check, roles })
})
