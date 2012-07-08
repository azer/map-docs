var errors   = require('../../lib/errors');

var string = jstype('string'),
    number = jstype('number'),
    id     = jstype('number');

function ts(schema, field, options, value){

  if( value == undefined || options.auto ){
    value = +(new Date);
  } else if( typeof value != 'number' ){
    throw errors.schemaTypeError(schema, field, value, 'Unix Timestamp');
  }

  return value;
}

function jstype(typeName){

  return function(schema, field, options, value){

    if( typeof value != typeName ){
      throw errors.schemaTypeError(schema, field,  value, typeName);
    }

    return value;

  };

};

module.exports = {
  'id': id,
  'number': number,
  'string': string,
  'ts': ts
};
