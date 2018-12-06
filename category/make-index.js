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
const gt = new Gettext()

const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')
const langs = require('../misc/langs')
const handleLanguages = require('../misc/make-handleLanguages')({ fs, path, gt, mo, langs })
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
    handleLanguages,
    sendValidation,
    catchExceptions,
    createCategory: makeCreateCategory({ getDb }),
    getCategories: makeGetCategories({ getDb, createFindFilters, cursorify }),
    getCategory: makeGetCategory({ getDb, ObjectID, createError, gt }),
    updateCategory: makeUpdateCategory({ getDb, ObjectID, createError, gt }),
    deleteCategory: makeDeleteCategory({ getDb, ObjectID, createError, gt }),
    addTerms: makeAddTerms({ getDb, ObjectID, createError, gt }),
    updateTerms: makeUpdateTerms({ getDb, ObjectID, createError, gt }),
    removeTerms: makeRemoveTerms({ getDb, ObjectID, createError, gt }),
    validateCreateCategory: makeValidateCreateCategory({ check }),
    validateUpdateCategory: makeValidateUpdateCategory({ check }),
    validateAddTerms: makeValidateAddTerms({ check }),
    validateUpdateTerms: makeValidateUpdateTerms({ check }),
    validateRemoveTerms: makeValidateRemoveTerms({ check })
  })
}
