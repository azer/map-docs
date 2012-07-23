var arraydb    = require('../array-db'),
    types      = arraydb.types,

    capitalize = require('./capitalize'),
    author     = require('./author');

var DEFAULT_BOOK_PRICE = 5,
    DEFAULT_BOOK_TAX   = 20;

var book = arraydb('books', {
  'title': { 'type': types.string, 'set': capitalize },
  'author': author,
  'price': { 'type': price, 'get': getPrice, 'set': setPrice, 'default': DEFAULT_BOOK_PRICE },
  'tax': { 'type': types.number, 'default': DEFAULT_BOOK_TAX },
  'createTS': types.ts,
  'lastUpdateTS': { 'type': types.ts, 'auto': true }
});

function getPrice(document, field, price){
  return '$' + ( price + price / 100 * document.tax() );
}

function setPrice(document, field, currentPrice, newPrice){
  return typeof newPrice == 'string' ? Number(newPrice.replace(/[^\d\.]+/g,'')) : newPrice;
}

function price(schema, field, options, value){

  if( value == undefined ){
    value = DEFAULT_BOOK_PRICE;
  }

  if(typeof value != 'number' && typeof value != 'string'){
    throw arraydb.errors.schemaTypeError(schema, field, value, 'number, string');
  }

  return value;
}

module.exports = book;
