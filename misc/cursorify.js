const ejson = require('ejson')
const base64Url = require('base64-url')

/**
 * How does it work (client side):
 * - send a `page` and `perPage` keys into a GET request to get the pagination
 * - put the values of the `X-Prev-Page-Cursor` and `X-Next-Page-Cursor` headers into a `X-Page-Cursor`
 *   header to get the previous and next pages. The `page` and `perPage` GET parameters become optional at
 *   this point
 * - use the `X-Pages-Count` and `X-Current-Page` headers to know where you are
 * - if you neither use the `page` and `perPage` GET parameters nor a cursor, you don't get pagination
 */
module.exports = async (req, res, collection, options = {}) => {
  const paginationOptions = {}
  const cursor = req.get('X-Page-Cursor')

  if (cursor) {
    try {
      const parsedCursor = ejson.parse(base64Url.decode(cursor))

      paginationOptions.limit = parseInt(parsedCursor.limit || 10)
      paginationOptions.skip = parseInt(parsedCursor.skip || 0)
    } catch (ex) {
      console.error('Unable to parse a page cursor', cursor)
      return options
    }
  } else if (req.query.page) {
    const perPage = parseInt(req.query.perPage || 10)
    let page = parseInt(req.query.page || 1)

    if (page <= 0) {
      page = 1
    }

    paginationOptions.limit = perPage
    paginationOptions.skip = perPage * (page - 1)
  } else {
    return options
  }

  options.limit = paginationOptions.limit
  options.skip = paginationOptions.skip

  const count = await collection.countDocuments()
  const pagesCount = Math.ceil(count / options.limit)
  const currentPage = Math.floor(options.skip / options.limit)

  res.setHeader('X-Pages-Count', pagesCount)
  res.setHeader('X-Current-Page', currentPage + 1)

  if (currentPage > 0) {
    res.setHeader('X-Prev-Page-Cursor', base64Url.encode(ejson.stringify({
      limit: options.limit,
      skip: currentPage * options.limit - options.limit
    })))
  }

  if (currentPage < pagesCount - 1) {
    res.setHeader('X-Next-Page-Cursor', base64Url.encode(ejson.stringify({
      limit: options.limit,
      skip: currentPage * options.limit + options.limit
    })))
  }

  return options
}
