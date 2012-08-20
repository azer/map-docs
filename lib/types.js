var logging = require('./logging')('types');

module.exports = {
  'ValidationError': ValidationError,
  'date': date,
  'email': email,
  'number': number,
  'string': string,
  'subschema': subschema,
  'unixtime': unixtime
};

/**
 * Following class is shamelessly copied from
 * https://github.com/joyent/node/blob/master/lib/assert.js
 */
function ValidationError(message, stackStartFunction){
  this.name     = 'ValidationError';
  this.message  = message;

  stackStartFunction || ( stackStartFunction = throwError );

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
}

ValidationError.prototype = new Error;

function throwError(actual, expected){
  throw new ValidationError('Invalid ' + expected + ': ' + actual);
}

function date(value, options){
  if (options && options.hasOwnProperty('auto'))
    return new Date;

  if (!(value instanceof Date))
    throwError(value, 'date');

  return value;
}

function email(value, options){

  if (typeof value != 'string')
    throwError(value, 'e-mail');

  if( ! /^[\w\-\_\.\+]+@[\w\-\_\.\+]+$/.test(value) )
    throwError(value, 'e-mail');

  return value;
}

function number(value, options){
  if (value == undefined && options && options.hasOwnProperty('default'))
    return options['default'];

  if (typeof value != 'number')
    throwError(value, 'number');

  return value;
};

function string(value, options){
  if (value == undefined && options && options.hasOwnProperty('default'))
    return options['default'];

  if (typeof value != 'string')
    throwError(value, 'string');

  if (options && options.hasOwnProperty('max') && value.length > options.max)
    throw new ValidationError('"' + value + '" cannot be longer than ' + options.max + ' characters.', string);

  if (options && options.hasOwnProperty('min') && value.length < options.min)
    throw new ValidationError('"' + value + '" cannot be shorter than ' + options.min + ' characters.', string);

  return value;
};

function subschema(value, options){
  if( typeof value == 'object' ){
    options.schema.validate(value);
    return value;
  }

  if( typeof value != 'number' && typeof value != 'string' ){
    throw throwError(value, 'number, string, object');
  }

  return value;
}

function unixtime(value, options){
  if (options && options.hasOwnProperty('auto'))
    return +(new Date);

  if (typeof value != 'number')
    throwError(value, 'number');

  return value;
}
