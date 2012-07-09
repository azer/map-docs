var arraydb = require('./array-db'),
    types = arraydb.types;

var DEFAULT_BOOK_PRICE = 5,
    DEFAULT_BOOK_TAX   = 20;

var book = arraydb('books', {
  'id': types.id,
  'title': types.string,
  'author': types.string,
  'price': { 'type': price, 'get': getPrice, 'set': setPrice },
  'tax': tax,
  'createTS': types.ts,
  'lastUpdateTS': { 'type': types.ts, 'auto': true }
});

function getPrice(model, field, price){
  return price + price / 100 * model.tax();
}

function setPrice(model, field, currentPrice, newPrice){
  return Number(newPrice.replace(/[^\d\.]+/g,''));
}

function price(schema, field, options, value){

  if(value == undefined){
    return DEFAULT_BOOK_PRICE;
  }

  if(typeof value != 'number' && typeof value != 'string'){
    throw arraydb.errors.schemaTypeError(schema, field, value, 'number, string');
  }

  return value;
}

function tax(schema, field, options, value){
  if(value == undefined){
    return DEFAULT_BOOK_TAX;
  }

  if(typeof value != 'number'){
    throw arraydb.errors.schemaTypeError(schema, field, value, 'number');
  }

  return value;
}

module.exports = book;
