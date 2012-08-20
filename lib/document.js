var logging        = require('./logging')('document'),
    prop           = require('./prop'),
    types          = require('./types'),
    id             = require('./id'),
    lowerCamelCase = require('./lower_camel_case');

module.exports = {
  'get': get,
  'find': find,
  'remove': remove,
  'save': save,
  'newDocument': newDocument,
  'toJSON': toJSON,
  'toString': toString,
  'validate': validate
};

/**
 * A proxy to the methods of given schema's driver.
 *
 * @param {String} method
 * @param {Schema} schema
 * @param {Any} params...
 */
function callDriver(method, schema/*, [params ...] */){
  var params = schema.options.concat( Array.prototype.slice.call(arguments, 2) );
  schema.driver.impl[method].apply(undefined, params);
}

/**
 * Find documents by specified query
 *
 * @param {Schema} schema
 * @param {Number, String, Object} query
 * @param {Function} callback
 */
function find(schema){
  var query    = arguments.length > 2 ? arguments[1] : undefined,
      callback = arguments[ arguments.length - 1 ];

  if( query && query.hasOwnProperty('id') ){
    query[ id(schema) ] = query.id;
    delete query.id;
  }

  callDriver('find', schema, query, function(error, results){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, results && results.map && results.map(function(el){
      return newDocument(schema, el);
    }));

  });
}

/**
 * Get the first matching record with specified query, including subdocuments.
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function get(schema, query, callback){
  logging.info('Getting %s from %s', query, schema);

  callDriver('get', schema, query, function(error, result){

    if(error){
      logging.fatal('Fatal error occured during querying:', error);
      callback(error);
      return;
    }

    if(!result){
      logging.debug('Returning no result for "%s"', query);
      callback();
      return;
    }

    callback(undefined, newDocument(schema, result));

  });
}

/**
 * Return the schema of given document
 *
 * @param {Document} document
 * @return {Schema}
 */
function getSchema(document){
  return document.id.schema;
}

/**
 * Determine if given object is a document or not
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isDocument(obj){
  return !!( obj && obj.id && obj.id.isDocument );
}

/**
 * Iterate subdocuments of given doc asynchronously.
 *
 * @param {Schema} schema
 * @param {Document} document
 * @param {Function} each
 * @param {Function} end
 */
function loopSubDocs(schema, document, each, end){

  var fields = Object.keys(schema.fields);

  (function iter(i, error){

    if(error){
      end(error);
      return;
    }

    if( i >= fields.length ){
      end();
      return;
    }

    if( !isDocument(document[fields[i]]) ){
      iter(i+1);
      return;
    }

    each(fields[i], document[fields[i]], iter.bind(undefined, i+1));

  }(0));
}

/**
 * Create a new document from given JSON content
 *
 * @param {Schema} schema
 * @param {Object} content
 * @return {Object}
 */
function newDocument(schema, content){
  logging.info('Creating a new %s document with given content "%s"', schema, content);

  var doc = {}, options, rawValue, value, contentFieldName, propertyName;

  Object.keys(schema.fields).forEach(function( fieldName ){
    propertyName     = lowerCamelCase(fieldName);
    contentFieldName = content.hasOwnProperty(fieldName) ? fieldName : content.hasOwnProperty(propertyName) ? propertyName : undefined;
    options          = schema.fields[fieldName];
    rawValue         = contentFieldName ? content[ contentFieldName ] : options['default'];

    if( typeof rawValue == 'object' && options.type == types.subschema  ) {
      value = isDocument(rawValue) ? rawValue : options.schema.create( rawValue );
    } else {
      value = prop(doc, rawValue, options.get || options.getter, options.set || options.setter);
    }

    doc[ propertyName ] = value;
  });

  doc.id = prop(doc, content[id(schema)]);
  doc.id.isDocument = true;
  doc.id.schema     = schema;

  doc.toString = toString.bind(undefined, doc);

  return doc;
}

/**
 * Remove the records matching with specified query.
 *
 * @param {Schema} schema
 * @param {String, Number, Object, Document} query
 * @param {Function} callback
 */
function remove(schema){
  logging.info('Removing %s from %s', toRemove || 'everything', schema);

  var toRemove = arguments.length > 2 ? arguments[1] : undefined,
      callback = arguments[ arguments.length - 1 ],
      query    = toRemove && toRemove.id();

  callDriver('remove', schema, query, function(error){

    if(error){
      callback(error);
      return;
    }

    toRemove && toRemove.id(undefined);
    callback();

  });
}

/**
 * Save given document including subdocs. Updates if already exists, inserts otherwise.
 *
 * @param {Schema} schema
 * @param {Document, Object} doc
 * @param {Function} callback
 */
function save(schema, doc, callback){
  logging.info('Saving %s', doc);

  callDriver('save', schema, toJSON(doc), function(error, id){

    if(error){
      callback(error);
      return;
    }

    doc.id(id);
    callback(undefined, id);

  });
}

/**
 * Return the content of given document as JSON
 *
 * @param {Document} doc
 * @return {Object}
 */
function toJSON(doc){

  var key, prop, value, field,
      schema = doc.id.schema,
      result = {};

  for(key in schema.fields) {
    field = lowerCamelCase(key);
    prop = doc[ field ];

    if( typeof prop == 'object' ){
      value = toJSON( prop );
    } else if( prop && prop.raw ) {
      value = prop.raw();
    } else {
      value = prop;
    }

    result[key] = value;
  }

  result[ id(schema) ] = doc.id();

  return result;
}

/**
 * Return the string representation of given document
 *
 * @param {Object} doc
 * @return {String}
 */
function toString(doc){
  return ( doc.id() != undefined ? doc.id() : 'draft' ) + '@' + getSchema(doc);
}

/**
 * Validate, and fix the content of given document if necessary.
 *
 * @param {Schema} schema
 * @param {Document} document
 * @return {Object}
 */
function validate(schema, document){

  logging.info('Validating "%s"', document);

  var field, prop, value;

  for( field in schema.fields ){
    prop = document[ lowerCamelCase(field) ];

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
 * @param {String} fieldName
 * @param value
 * @return
 */
function validateField(schema, fieldName, value){
  var field       = schema.fields[fieldName],
      validatorFn = field.type;

  return validatorFn( value, field);
}
