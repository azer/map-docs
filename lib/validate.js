var errors = require('./errors');

/**
 * Validate, and fix the content of given document if necessary.
 *
 * @param {Schema} schema
 * @param {Document} document
 * @return {Object}
 */
function document(schema, document){

  // logging.info('%s is validating the document "%s"', schema, schema, document);

  var field, prop, value;

  for( field in schema.fields ){
    prop = document[ fixPropertyName(field) ];

    if( typeof prop == 'function' ){
      prop.raw( validateField( schema, field,  prop.raw() ) );
    } else {
      validateField( schema, field, prop );
    }

  }

}

/**
 * Validate, and fix the value of given schema field if necessary.
 *
 * @param {Schema} schema
 * @param {String} field
 * @param value
 * @return
 */
function field(schema, field, value){

  var options = schema.fields[field],
      typefn = typeof options == 'function' ? options : options && options.type;

  if( typeof typefn != 'function' ){
    throw errors.schemaFieldWithoutValidator(schema, field);
  }

  return typefn( schema, field, options, value );
}

module.exports = {
  'document': document,
  'field': field
};
