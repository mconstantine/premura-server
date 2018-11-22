const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const { MongoClient, ObjectID, Cursor } = require('mongodb')
const ejson = require('ejson')
const base64Url = require('base64-url')

const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')
const createError = require('../misc/createServerError')
const createFindFilters = require('../misc/createFindFilters')
const makeGetDb = require('../misc/make-getDb')
const cursorify = require('../misc/make-cursorify')({ ejson, base64Url, Cursor })

const makeCreateCategory = require('./make-createCategory')
const makeGetCategories = require('./make-getCategories')
const makeGetCategory = require('./make-getCategory')
const makeUpdateCategory = require('./make-updateCategory')
const makeDeleteCategory = require('./make-deleteCategory')
const makeAddTerms = require('./make-addTerms')
const makeUpdateTerms = require('./make-updateTerms')
const makeRemoveTerms = require('./make-removeTerms')
const makeValidateCreateCategory = require('./make-validateCreateCategory')
const makeValidateUpdateCategory = require('./make-validateUpdateCategory')
const makeValidateAddTerms = require('./make-validateAddTerms')
const makeValidateUpdateTerms = require('./make-validateUpdateTerms')
const makeValidateRemoveTerms = require('./make-validateRemoveTerms')

const sendValidation = makeSendValidation({ validationResult })

module.exports = ({ config }) => {
  const getDb = makeGetDb({ MongoClient, config })

  return endpoint({
    router,
    loginGate,
    sendValidation,
    catchExceptions,
    createCategory: makeCreateCategory({ getDb, createError }),
    getCategories: makeGetCategories({ getDb, createFindFilters, cursorify }),
    getCategory: makeGetCategory({ getDb, ObjectID, createError }),
    updateCategory: makeUpdateCategory({ getDb, ObjectID, createError }),
    deleteCategory: makeDeleteCategory({ getDb, ObjectID, createError }),
    addTerms: makeAddTerms({ getDb, ObjectID, createError }),
    updateTerms: makeUpdateTerms({ getDb, ObjectID, createError }),
    removeTerms: makeRemoveTerms({ getDb, ObjectID, createError }),
    validateCreateCategory: makeValidateCreateCategory({ check }),
    validateUpdateCategory: makeValidateUpdateCategory({ check }),
    validateAddTerms: makeValidateAddTerms({ check }),
    validateUpdateTerms: makeValidateUpdateTerms({ check }),
    validateRemoveTerms: makeValidateRemoveTerms({ check })
  })
}
