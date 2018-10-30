const makeSendValidation = require('./make-sendValidation')

describe('sendValidation', () => {
  let isEmptyResult, arrayResult

  const result = {
    isEmpty: () => isEmptyResult,
    array: () => arrayResult
  }

  const validationResult = () => result

  const res = {
    status: jest.fn(() => res),
    send: jest.fn()
  }

  const next = jest.fn()
  const sendValidation = makeSendValidation({ validationResult })

  it('Should send a 422 status with the errors if found', () => {
    next.mockClear()
    isEmptyResult = false
    arrayResult = 'testResult'

    sendValidation(null, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenLastCalledWith(422)
    expect(res.send).toHaveBeenCalledWith({ errors: arrayResult })
  })

  it('Should call next if no error is found', () => {
    next.mockClear()
    res.send.mockClear()
    isEmptyResult = true
    sendValidation(null, res, next)
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
