var errors  = require('./errors'),
    logging = require('./logging');

var string = jstype('string'),
    number = jstype('number');

function id(schema, field, options, value){
  return value;
}

function jstype(typeName){

  return function(schema, field, options, value){

    if(options.hasOwnProperty('default') && value == undefined){
      value = options['default'];
    }

    if( typeof value != typeName ){
      throw errors.schemaTypeError(schema, field,  value, typeName);
    }

    return value;

  };

};

function subschema(schema, field, options, value){

  if( typeof value == 'object' ){
    options.schema.validate(value);
    return value;
  }

  if( typeof value != 'number' && typeof value != 'string' ){
    throw errors.schemaTypeError(schema, field,  value, 'number, string, object');
  }

  return value;
}

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
  'subschema': subschema,
  'ts': ts
};
