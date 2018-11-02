const router = require('express').Router()
const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const { ObjectID } = require('mongodb')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')
const createError = require('../misc/createServerError')
const cursorify = require('../misc/cursorify')

const makeCreateCategory = require('./make-createCategory')
const makeGetCategories = require('./make-getCategories')
const makeUpdateCategory = require('./make-updateCategory')
const makeDeleteCategory = require('./make-deleteCategory')
const makeAddTerms = require('./make-addTerms')
const makeValidateCreateCategory = require('./make-validateCreateCategory')
const makeValidateUpdateCategory = require('./make-validateUpdateCategory')
const makeValidateAddTerms = require('./make-validateAddTerms')
const getDb = require('../misc/getDb')

const sendValidation = makeSendValidation({ validationResult })

module.exports = endpoint({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory: makeCreateCategory({ getDb, createError }),
  getCategories: makeGetCategories({ getDb, cursorify }),
  updateCategory: makeUpdateCategory({ getDb, ObjectID, createError }),
  deleteCategory: makeDeleteCategory({ getDb, ObjectID, createError }),
  addTerms: makeAddTerms({ getDb, ObjectID, createError }),
  validateCreateCategory: makeValidateCreateCategory({ check }),
  validateUpdateCategory: makeValidateUpdateCategory({ check }),
  validateAddTerms: makeValidateAddTerms({ check })
})
