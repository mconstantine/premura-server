const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const createError = require('../misc/createServerError')
const roles = require('../misc/roles')
const getDb = require('../misc/getDb')
const { ObjectID } = require('mongodb')
const cursorify = require('../misc/cursorify')
const find = require('../misc/find')
const sensitiveInformationProjection = require('./sensitiveInformationProjection')
const catchExceptions = require('../misc/catchExceptions')

const makeSendValidation = require('../misc/make-sendValidation')
const router = require('express').Router()
const endpoint = require('./endpoint')
const loginGate = require('../misc/loginGate')
const makeCreateUser = require('./make-createUser')
const makeGetUsers = require('./make-getUsers')
const makeGetUser = require('./make-getUser')
const makeGetJobRoles = require('./make-getJobRoles')
const makeUpdateUser = require('./make-updateUser')
const makeDeleteUser = require('./make-deleteUser')
const makeLogin = require('./make-login')
const logout = require('./logout')

const makeValidateLogin = require('./make-validateLogin')
const makeValidateCreateUser = require('./make-validateCreateUser')
const makeValidateUpdateUser = require('./make-validateUpdateUser')

module.exports = endpoint({
  catchExceptions,
  router,
  loginGate,
  createUser: makeCreateUser({ bcrypt, createError, roles, getDb, sensitiveInformationProjection }),
  getUsers: makeGetUsers({ getDb, cursorify, find, sensitiveInformationProjection }),
  getUser: makeGetUser({ getDb, createError, ObjectID, sensitiveInformationProjection }),
  getJobRoles: makeGetJobRoles({ getDb }),
  updateUser: makeUpdateUser({
    createError, ObjectID, getDb, roles, bcrypt, sensitiveInformationProjection
  }),
  deleteUser: makeDeleteUser({ createError, ObjectID, getDb, roles }),
  login: makeLogin({ bcrypt, createError, getDb }),
  logout,
  sendValidation: makeSendValidation({ validationResult }),
  validateLogin: makeValidateLogin({ check }),
  validateCreateUser: makeValidateCreateUser({ check, roles }),
  validateUpdateUser: makeValidateUpdateUser({ check, roles })
})
