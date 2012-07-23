function schemaTypeError(schema, field, value, expectedTypeName){
  return new Error('Invalid schema entry: "' + value + '" for ' + field + '/' + schema + '. Expected Type: ' + expectedTypeName);
}

function schemaFieldWithoutValidator(schema, field){
  return new Error('Schema field without any validator function: "' + field + '/' + schema + '"');
}

module.exports = {
  'schemaTypeError': schemaTypeError,
  'schemaFieldWithoutValidator': schemaFieldWithoutValidator
};
