const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const { MongoClient, ObjectID, Cursor } = require('mongodb')

const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')
const createError = require('../misc/createServerError')
const makeGetDb = require('../misc/make-getDb')
const userCanReadProject = require('../project/make-userCanReadProject')({ ObjectID })
const sensitiveInformationProjection = require('../user/sensitiveInformationProjection')
const getActivityFromDb = require('./make-getActivityFromDb')({ sensitiveInformationProjection })
const ejson = require('ejson')
const base64Url = require('base64-url')
const cursorify = require('../misc/make-cursorify')({ ejson, base64Url, Cursor })
const createFindFilters = require('../misc/createFindFilters')

const makeCreateActivity = require('./make-createActivity')
const makeGetActivities = require('./make-getActivities')
const makeUpdateActivity = require('./make-updateActivity')
const makeAddPeople = require('./make-addPeople')
const makeRemovePeople = require('./make-removePeople')
const makeValidateCreateActivity = require('./make-validateCreateActivity')
const makeValidateGetActivities = require('./make-validateGetActivities')
const makeValidateUpdateActivity = require('./make-validateUpdateActivity')
const makeValidateEditPeople = require('./make-validateEditPeople')

const sendValidation = makeSendValidation({ validationResult })

module.exports = ({ config }) => {
  const getDb = makeGetDb({ MongoClient, config })

  return endpoint({
    router,
    loginGate,
    sendValidation,
    catchExceptions,
    createActivity: makeCreateActivity({
      getDb, ObjectID, createError, userCanReadProject
    }),
    getActivities: makeGetActivities({
      getDb, ObjectID, cursorify, createFindFilters
    }),
    updateActivity: makeUpdateActivity({
      getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
    }),
    addPeople: makeAddPeople({
      getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
    }),
    removePeople: makeRemovePeople({
      getDb, ObjectID, createError, userCanReadProject, getActivityFromDb
    }),
    validateCreateActivity: makeValidateCreateActivity({ check }),
    validateGetActivities: makeValidateGetActivities({ check }),
    validateUpdateActivity: makeValidateUpdateActivity({ check }),
    validateEditPeople: makeValidateEditPeople({ check })
  })
}
