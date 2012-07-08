function error(code, msg){
  var e = new Error(msg);
  e.statusCode = code;
  return e;
}

function schemaTypeError(schema, field, value, expectedTypeName){
  return error(500, 'Invalid schema entry: "' + value + '" for ' + field + '/' + schema.name + '. Expected Type: ' + expectedTypeName);
}

function invalidSchemaField(schema, field){
  return error(500, 'Invalid schema field "' + field + '/' + schema.name + '"');
}

module.exports = {
  'error':error,
  'schemaTypeError': schemaTypeError,
  'invalidSchemaField': invalidSchemaField
};
