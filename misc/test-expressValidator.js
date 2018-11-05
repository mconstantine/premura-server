let whats, calls

const check = function check(what) {
  whats = whats || []
  whats.push(what)

  calls = calls || []
  calls.push({
    trim: jest.fn(function() { return this }),
    not: jest.fn(function() { return this }),
    isEmpty: jest.fn(function() { return this }),
    withMessage: jest.fn(function() { return this }),
    isEmail: jest.fn(function() { return this }),
    isLength: jest.fn(function() { return this }),
    custom: jest.fn(function() { return this }),
    isIn: jest.fn(function() { return this }),
    optional: jest.fn(function() { return this }),
    isMongoId: jest.fn(function() { return this }),
    isBoolean: jest.fn(function() { return this }),
    isString: jest.fn(function() { return this }),
    isArray: jest.fn(function() { return this }),
    isNumeric: jest.fn(function() { return this }),
    isISO8601: jest.fn(function() { return this }),
    isAfter: jest.fn(function() { return this }),
    exists: jest.fn(function() { return this })
  })

  return calls[calls.length - 1]
}

check.validate = function validate(what, ...expected) {
  const call = getCheckCall(what)

  Object.keys(call).forEach(foo => {
    if (expected.includes(foo)) {
      expect(call[foo]).toHaveBeenCalled()
    } else {
      expect(call[foo]).not.toHaveBeenCalled()
    }
  })
}

function getCheckCall(what) {
  const callIndex = whats.indexOf(what)

  if (callIndex < 0) {
    return false
  }

  return calls[callIndex]
}

module.exports = check
