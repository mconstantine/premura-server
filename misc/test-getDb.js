const results = {}
let lastResult, lastArgs, currentCollection

const getResult = (value, ...args) => value instanceof Function ? value(...args) : value

const Collection = {
  find: jest.fn((...args) => {
    lastArgs = args
    return Collection
  }),
  aggregate: jest.fn((...args) => {
    lastArgs = args
    return Collection
  }),
  findOne: jest.fn((...args) => getResult(results.findOne, ...args)),
  findOneAndUpdate: jest.fn((...args) => getResult(results.findOneAndUpdate, ...args)),
  updateOne: jest.fn((...args) => getResult(results.updateOne, ...args)),
  insertOne: jest.fn((...args) => getResult(results.insertOne, ...args)),
  deleteOne: jest.fn((...args) => getResult(results.deleteOne, ...args)),
  deleteMany: jest.fn((...args) => getResult(results.deleteMany, ...args)),
  distinct: jest.fn((...args) => getResult(results.distinct, ...args)),
  toArray: jest.fn(() => getResult(results[lastResult], ...lastArgs))
}

const collection = collectionName => {
  currentCollection = collectionName
  return Collection
}

const getDb = () => ({ collection })

getDb.functions = Collection
getDb.getResult = key => results[key]

getDb.setResult = (key, value) => {
  lastResult = key
  results[key] = value
}

getDb.getCurrentCollection = () => currentCollection

module.exports = getDb
