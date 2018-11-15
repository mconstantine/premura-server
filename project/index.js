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
const sensitiveInformationProjection = require('../user/sensitiveInformationProjection')
const makeGetProjectFromDb = require('./make-getProjectFromDb')
const getProjectFromDb = makeGetProjectFromDb({ sensitiveInformationProjection })
const makeUserCanReadProject = require('./make-userCanReadProject')
const userCanReadProject = makeUserCanReadProject({ ObjectID })

const makeGetProjects = require('./make-getProjects')
const makeGetProject = require('./make-getProject')
const makeCreateProject = require('./make-createProject')
const makeUpdateProject = require('./make-updateProject')
const makeDeleteProject = require('./make-deleteProject')
const makeAddPeople = require('./make-addPeople')
const makeUpdatePeople = require('./make-updatePeople')
const makeRemovePeople = require('./make-removePeople')
const makeValidateCreateProject = require('./make-validateCreateProject')
const makeValidateUpdateProject = require('./make-validateUpdateProject')
const makeValidateGetProjects = require('./make-validateGetProjects')
const makeValidateEditPeople = require('./make-validateEditPeople')

module.exports = endpoint({
  catchExceptions,
  router,
  loginGate,
  sendValidation: makeSendValidation({ validationResult }),
  getProjects: makeGetProjects({ getDb, ObjectID, cursorify, createFindFilters }),
  getProject: makeGetProject({ getDb, ObjectID, createError, getProjectFromDb, userCanReadProject }),
  createProject: makeCreateProject({ getDb }),
  updateProject: makeUpdateProject({ getDb, ObjectID, createError, userCanReadProject }),
  deleteProject: makeDeleteProject({ getDb, ObjectID, createError, userCanReadProject }),
  addPeople: makeAddPeople({ getDb, ObjectID, createError, getProjectFromDb }),
  updatePeople: makeUpdatePeople({ getDb, ObjectID, createError, getProjectFromDb }),
  removePeople: makeRemovePeople({ getDb, ObjectID, createError, getProjectFromDb }),
  validateCreateProject: makeValidateCreateProject({ check, status }),
  validateUpdateProject: makeValidateUpdateProject({ check, status }),
  validateGetProjects: makeValidateGetProjects({ check, status }),
  validateEditPeople: makeValidateEditPeople({ check })
})
