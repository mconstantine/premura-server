const router = require('express').Router()
const endpoint = require('./endpoint')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const getDb = require('../misc/getDb')
const createError = require('../misc/createServerError')
const { ObjectID } = require('mongodb')

const loginGate = require('../misc/loginGate')
const makeSendValidation = require('../misc/make-sendValidation')
const catchExceptions = require('../misc/catchExceptions')
const status = require('../misc/status')

const makeCreateProject = require('./make-createProject')
const makeUpdateProject = require('./make-updateProject')
const makeValidateCreateProject = require('./make-validateCreateProject')
const makeValidateUpdateProject = require('./make-validateUpdateProject')

module.exports = endpoint({
  catchExceptions,
  router,
  loginGate,
  sendValidation: makeSendValidation({ validationResult }),
  createProject: makeCreateProject({ getDb }),
  updateProject: makeUpdateProject({ getDb, ObjectID, createError }),
  validateCreateProject: makeValidateCreateProject({ check, status }),
  validateUpdateProject: makeValidateUpdateProject({ check, status })
})
