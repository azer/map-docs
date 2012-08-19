arraydb    = require '../array-db'
author     = require './author'
capitalize = require './capitalize'

DEFAULT_BOOK_PRICE = 5
DEFAULT_BOOK_TAX   = 20

getPrice = (price, document) ->
  "$#{ price + price / 100 * document.tax() }"

setPrice = (newPrice, oldPrice, document) ->
  if typeof newPrice == 'string'
    Number( newPrice.replace /[^\d\.]+/g, '' )
  else
    newPrice

book = arraydb {
    title: { type: String, set: capitalize }
    author: author
    price: { type: Number, get: getPrice, set: setPrice, default: DEFAULT_BOOK_PRICE }
    tax: { type: Number, default: DEFAULT_BOOK_TAX }
  }

module.exports = book
