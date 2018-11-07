const results = {}
let lastResult, currentCollection

const Collection = {
  find: jest.fn(() => Collection),
  aggregate: jest.fn(() => Collection),
  findOne: jest.fn(() => results.findOne),
  updateOne: jest.fn(() => results.updateOne),
  insertOne: jest.fn(() => results.insertOne),
  deleteOne: jest.fn(() => results.deleteOne),
  distinct: jest.fn(() => results.distinct),
  toArray: jest.fn(() => results[lastResult])
}

const collection = (collectionName) => {
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
