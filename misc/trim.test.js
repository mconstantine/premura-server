const trim = require('./trim')

describe('trim', () => {
  it('Should remove spaces from the beginning of a string', () => {
    expect(trim('  string')).toBe('string')
  })

  it('Should remove spaces from the end of a string', () => {
    expect(trim('string  ')).toBe('string')
  })
})
