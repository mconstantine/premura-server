module.exports = class ObjectID {
  constructor(string) {
    this.string = string
  }

  static isValid(string) {
    return !!string
  }

  equals(string) {
    return this.string === string
  }
}
