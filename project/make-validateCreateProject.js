module.exports = ({ check, status }) => [
  check('name').trim()
  .not().isEmpty().withMessage('name is empty')
  .isString().withMessage('name should be a String'),

  check('description').optional().trim()
  .not().isEmpty().withMessage('description is empty')
  .isString().withMessage('description should be a String'),

  check('budget').optional().trim()
  .isNumeric().withMessage('budget should be a Number'),

  check('people').optional()
  .isArray().withMessage('people should be an Array')
  .custom((people, { req }) => {
    if (
      req.body.budget &&
      people.reduce((res, person) => res || Number.isInteger(person.budget), false)
    ) {
      const expected = parseInt(req.body.budget)
      const actual = people.reduce((res, { budget }) => res + parseInt(budget), 0)

      if (expected !== actual) {
        throw new Error("the sum of people's budgets should be the same as the project's budget")
      }
    }

    return people
  }),

  check('people.*._id')
  .isMongoId().withMessage('invalid person id'),

  check('deadlines').optional()
  .isArray().withMessage('deadlines should be an Array'),

  check('deadlines.*').optional()
  .isISO8601().withMessage('deadlines should be valid ISO8601 dates')
  .isAfter(new Date().toISOString()).withMessage('deadlines should be in the future'),

  check('status').optional()
  .isString().withMessage('status should be a String')
  .isIn(status).withMessage(`status should be one of ${status.join(', ')}`),

  check('terms')
  .not().exists().withMessage('this endpoint cannot operate on terms')
]
