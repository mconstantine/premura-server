module.exports = class ObjectID {
  constructor(string) {
    this.string = string
  }

  static isValid(string) {
    return !!string
  }

  equals(other) {
    return this.string === (other.string || other)
  }

  toString() {
    return this.string
  }
}
