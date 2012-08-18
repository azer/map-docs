arraydb    = require '../array-db'
author     = require './author'
capitalize = require './capitalize'

DEFAULT_BOOK_PRICE = 5
DEFAULT_BOOK_TAX   = 20

book = arraydb {
    title: { type: String, set: capitalize }
    author: author
    price: { type: Number, get: getPrice, set: setPrice, default: DEFAULT_BOOK_PRICE }
    tax: { type: Number, default: DEFAULT_BOOK_PRICE }
  }

price = (schema, field, options, value) ->

  if value == undefined
    value = DEFAULT_BOOK_PRICE

  if typeof value != 'number' and typeof value != 'string'
    throw arraydb.errors.schemaTypeError schema, field, value, 'number or string'

  return value

getPrice = (document, field, price) ->
  "$#{ price + price / 100 * document.tax() }"

setPrice = (document, field, oldPrice, newPrice) ->
  if typeof newPrice == 'string'
    Number( newPrice.replace /[^\d\.]+/g, '' )
  else
    newPrice

module.exports = book
