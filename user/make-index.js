const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectID, Cursor } = require('mongodb')
const bcrypt = require('bcryptjs')
const ejson = require('ejson')
const base64Url = require('base64-url')
const { validationResult } = require('express-validator/check')
const { check } = require('express-validator/check')
const Gettext = require('node-gettext')
const { mo } = require('gettext-parser')
const gt = new Gettext()

const createError = require('../misc/createServerError')
const roles = require('../misc/roles')
const langs = require('../misc/langs')
const makeGetDb = require('../misc/make-getDb')
const createFindFilters = require('../misc/createFindFilters')
const sensitiveInformationProjection = require('./sensitiveInformationProjection')
const catchExceptions = require('../misc/catchExceptions')
const cursorify = require('../misc/make-cursorify')({ ejson, base64Url, Cursor })

const makeSendValidation = require('../misc/make-sendValidation')
const router = require('express').Router()
const endpoint = require('./endpoint')
const loginGate = require('../misc/loginGate')
const handleLanguages = require('../misc/make-handleLanguages')({ gt })
const makeCreateUser = require('./make-createUser')
const makeGetUsers = require('./make-getUsers')
const makeGetUser = require('./make-getUser')
const makeGetJobRoles = require('./make-getJobRoles')
const makeUpdateUser = require('./make-updateUser')
const makeDeleteUser = require('./make-deleteUser')
const makeLogin = require('./make-login')
const logout = require('./logout')

const makeValidateLogin = require('./make-validateLogin')
const makeValidateCreateUser = require('./make-validateCreateUser')
const makeValidateUpdateUser = require('./make-validateUpdateUser')

langs.forEach(lang => {
  const filePath = path.resolve(__dirname, '../languages', `${lang}.mo`)

  if (!fs.existsSync(filePath)) {
    return
  }

  const translation = fs.readFileSync(filePath)
  const parsedTranslation = mo.parse(translation)

  gt.addTranslations(lang, 'premura', parsedTranslation)
  gt.setTextDomain('premura')
})

module.exports = ({ config }) => {
  const getDb = makeGetDb({ MongoClient, config })

  return endpoint({
    catchExceptions,
    router,
    loginGate,
    handleLanguages,
    createUser: makeCreateUser({
      bcrypt, createError, roles, getDb, sensitiveInformationProjection, gt
    }),
    getUsers: makeGetUsers({ getDb, cursorify, createFindFilters, sensitiveInformationProjection }),
    getUser: makeGetUser({ getDb, createError, ObjectID, sensitiveInformationProjection }),
    getJobRoles: makeGetJobRoles({ getDb }),
    updateUser: makeUpdateUser({
      createError, ObjectID, getDb, roles, bcrypt, sensitiveInformationProjection
    }),
    deleteUser: makeDeleteUser({ createError, ObjectID, getDb, roles }),
    login: makeLogin({ bcrypt, createError, getDb }),
    logout,
    sendValidation: makeSendValidation({ validationResult }),
    validateLogin: makeValidateLogin({ check }),
    validateCreateUser: makeValidateCreateUser({ check, roles, langs }),
    validateUpdateUser: makeValidateUpdateUser({ check, roles, langs })
  })
}
