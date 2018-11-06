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
const cursorify = require('../misc/cursorify')
const createFindFilters = require('../misc/createFindFilters')

const makeGetProjects = require('./make-getProjects')
const makeGetProject = require('./make-getProject')
const makeCreateProject = require('./make-createProject')
const makeUpdateProject = require('./make-updateProject')
const makeValidateCreateProject = require('./make-validateCreateProject')
const makeValidateUpdateProject = require('./make-validateUpdateProject')
const makeValidateGetProjects = require('./make-validateGetProjects')

module.exports = endpoint({
  catchExceptions,
  router,
  loginGate,
  sendValidation: makeSendValidation({ validationResult }),
  getProjects: makeGetProjects({ getDb, ObjectID, cursorify, createFindFilters }),
  getProject: makeGetProject({ getDb, ObjectID, createError }),
  createProject: makeCreateProject({ getDb }),
  updateProject: makeUpdateProject({ getDb, ObjectID, createError }),
  validateCreateProject: makeValidateCreateProject({ check, status }),
  validateUpdateProject: makeValidateUpdateProject({ check, status }),
  validateGetProjects: makeValidateGetProjects({ check, status })
})
