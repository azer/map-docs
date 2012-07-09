var errors = require('./errors');

var string = jstype('string'),
    number = jstype('number');

function id(schema, field, options, value){
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

function ts(schema, field, options, value){

  if( value == undefined || ( options && options.auto ) ){
    value = +(new Date);
  } else if( typeof value != 'number' ){
    throw errors.schemaTypeError(schema, field, value, 'Unix Timestamp');
  }

  return value;
}

module.exports = {
  'id': id,
  'number': number,
  'string': string,
  'ts': ts
};
