const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const { MongoClient, ObjectID } = require('mongodb')

const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')
const createError = require('../misc/createServerError')
const makeGetDb = require('../misc/make-getDb')
const userCanReadProject = require('../project/make-userCanReadProject')({ ObjectID })

const makeCreateActivity = require('./make-createActivity')
const makeUpdateActivity = require('./make-updateActivity')
const makeValidateCreateActivity = require('./make-validateCreateActivity')
const makeValidateUpdateActivity = require('./make-validateUpdateActivity')

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
    updateActivity: makeUpdateActivity({
      getDb, ObjectID, createError, userCanReadProject
    }),
    validateCreateActivity: makeValidateCreateActivity({ check }),
    validateUpdateActivity: makeValidateUpdateActivity({ check })
  })
}
