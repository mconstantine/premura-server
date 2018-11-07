const createServerError = require('./createServerError')

describe('createServerError', () => {
  it('Should create an error', () => {
    const error = createServerError(42, 'The question is wrong.')
    expect(error).toBeInstanceOf(Error)
  })

  it('Should create an error with an httpCode', () => {
    const error = createServerError(42, 'The question is wrong.')
    expect(error).toHaveProperty('httpCode')
    expect(error.httpCode).toBe(42)
  })

  it('Should create an error with a message', () => {
    const error = createServerError(42, 'The question is wrong.')
    expect(error).toHaveProperty('message')
    expect(error.message).toBe('The question is wrong.')
  })
})
