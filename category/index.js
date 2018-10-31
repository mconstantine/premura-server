const router = require('express').Router()
const endpoint = require('./endpoint')
const catchExceptions = require('../misc/catchExceptions')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const makeSendValidation = require('../misc/make-sendValidation')
const loginGate = require('../misc/loginGate')

const makeCreateCategory = require('./make-createCategory')
const makeValidateCreateCategory = require('./make-validateCreateCategory')
const getDb = require('../misc/getDb')

const sendValidation = makeSendValidation({ validationResult })

module.exports = endpoint({
  router,
  loginGate,
  sendValidation,
  catchExceptions,
  createCategory: makeCreateCategory({ getDb }),
  validateCreateCategory: makeValidateCreateCategory({ check })
})
