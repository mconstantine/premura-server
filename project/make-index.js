const fs = require('fs')
const path = require('path')
const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const { MongoClient, ObjectID, Cursor } = require('mongodb')
const ejson = require('ejson')
const base64Url = require('base64-url')
const Gettext = require('node-gettext')
const { mo } = require('gettext-parser')

const endpoint = require('./endpoint')
const loginGate = require('../misc/loginGate')
const langs = require('../misc/langs')
const handleLanguages = require('../misc/make-handleLanguages')({ fs, path, Gettext, mo, langs })
const gt = global.gt
const createError = require('../misc/createServerError')
const makeGetDb = require('../misc/make-getDb')
const catchExceptions = require('../misc/catchExceptions')
const status = require('../misc/status')
const createFindFilters = require('../misc/createFindFilters')
const sensitiveInformationProjection = require('../user/sensitiveInformationProjection')
const getProjectFromDb = require('./make-getProjectFromDb')({ sensitiveInformationProjection })
const userCanReadProject = require('./make-userCanReadProject')({ ObjectID })
const cursorify = require('../misc/make-cursorify')({ ejson, base64Url, Cursor })

const makeSendValidation = require('../misc/make-sendValidation')
const makeGetProjects = require('./make-getProjects')
const makeGetProject = require('./make-getProject')
const makeCreateProject = require('./make-createProject')
const makeUpdateProject = require('./make-updateProject')
const makeDeleteProject = require('./make-deleteProject')
const makeAddPeople = require('./make-addPeople')
const makeUpdatePeople = require('./make-updatePeople')
const makeRemovePeople = require('./make-removePeople')
const makeAddDeadlines = require('./make-addDeadlines')
const makeRemoveDeadlines = require('./make-removeDeadlines')
const makeAddTerms = require('./make-addTerms')
const makeMoveTerms = require('./make-moveTerms')
const makeRemoveTerms = require('./make-removeTerms')
const makeValidateCreateProject = require('./make-validateCreateProject')
const makeValidateUpdateProject = require('./make-validateUpdateProject')
const makeValidateGetProjects = require('./make-validateGetProjects')
const makeValidateEditPeople = require('./make-validateEditPeople')
const makeValidateEditDeadlines = require('./make-validateEditDeadlines')
const makeValidateEditTerms = require('./make-validateEditTerms')
const makeValidateMoveTerms = require('./make-validateMoveTerms')

module.exports = ({ config }) => {
  const getDb = makeGetDb({ MongoClient, config })

  return endpoint({
    catchExceptions,
    router,
    loginGate,
    handleLanguages,
    sendValidation: makeSendValidation({ validationResult }),
    getProjects: makeGetProjects({ getDb, ObjectID, cursorify, createFindFilters }),
    getProject: makeGetProject({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    createProject: makeCreateProject({ getDb }),
    updateProject: makeUpdateProject({ getDb, ObjectID, createError, userCanReadProject, gt }),
    deleteProject: makeDeleteProject({ getDb, ObjectID, createError, userCanReadProject, gt }),
    addPeople: makeAddPeople({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    updatePeople: makeUpdatePeople({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    removePeople: makeRemovePeople({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    addDeadlines: makeAddDeadlines({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    removeDeadlines: makeRemoveDeadlines({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    addTerms: makeAddTerms({ getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt }),
    moveTerms: makeMoveTerms({ getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt }),
    removeTerms: makeRemoveTerms({
      getDb, ObjectID, createError, getProjectFromDb, userCanReadProject, gt
    }),
    validateCreateProject: makeValidateCreateProject({ check, status }),
    validateUpdateProject: makeValidateUpdateProject({ check, status }),
    validateGetProjects: makeValidateGetProjects({ check, status }),
    validateEditPeople: makeValidateEditPeople({ check }),
    validateEditDeadlines: makeValidateEditDeadlines({ check }),
    validateEditTerms: makeValidateEditTerms({ check }),
    validateMoveTerms: makeValidateMoveTerms({ check })
  })
}
