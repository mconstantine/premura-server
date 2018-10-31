let _getCheckCall

const getCheckCall = function(what) {
  return _getCheckCall(what)
}

const check = function(what) {
  this.whats = this.whats || []
  this.whats.push(what)

  this.calls = this.calls || []
  this.calls.push({
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
    toBoolean: jest.fn(function() { return this }),
    isArray: jest.fn(function() { return this })
  })

  _getCheckCall = function(what) {
    const callIndex = this.whats.indexOf(what)

    if (callIndex < 0) {
      return false
    }

    return this.calls[callIndex]
  }

  return this.calls[this.calls.length - 1]
}

module.exports.check = check
module.exports.getCheckCall = getCheckCall
