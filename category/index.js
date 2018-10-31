const router = require('express').Router()
const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')

const makeCreateCategory = require('./make-createCategory')
const makeAddTerms = require('./make-addTerms')
const makeValidateCreateCategory = require('./make-validateCreateCategory')
const makeValidateAddTerms = require('./make-validateAddTerms')
const getDb = require('../misc/getDb')

const sendValidation = makeSendValidation({ validationResult })

module.exports = endpoint({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory: makeCreateCategory({ getDb }),
  addTerms: makeAddTerms({ getDb }),
  validateCreateCategory: makeValidateCreateCategory({ check }),
  validateAddTerms: makeValidateAddTerms({ check })
})
