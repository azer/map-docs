var logging        = require('./logging')('document'),
    prop           = require('./prop'),
    types          = require('./types'),
    id             = require('./id'),
    lowerCamelCase = require('./lower_camel_case');

function callDriver(method, schema/*, [params ...] */){
  var params = schema.options.concat( Array.prototype.slice.call(arguments, 2) );
  schema.driver.impl[method].apply(undefined, params);
}

/**
 * Find documents by specified query
 *
 * @param {Schema} schema
 * @param {Array} params
 * @param {Function} callback
 */
function find(schema, query, callback){
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

  var doc = {},
      options, rawValue, value;

  Object.keys(schema.fields).forEach(function( field ){

    options  = schema.fields[field];
    rawValue = content.hasOwnProperty( field ) ? content[ field ] : options['default'];

    if( typeof rawValue == 'object' && options.type == types.subschema  ) {
      value = isDocument(rawValue) ? rawValue : options.schema.create( rawValue );
    } else {
      value = prop(doc, rawValue, options.get || options.getter, options.set || options.setter);
    }

    doc[ lowerCamelCase(field) ] = value;

  });

  doc.id = prop(doc, content[id(schema)]);

  doc.id.isDocument = true;
  doc.id.schema     = schema;

  doc.toString = function(){
    return doc.id() + '@' + schema.toString();
  };

  return doc;
}

/**
 * Save given document including subdocs. Updates if already exists, inserts otherwise.
 *
 * @param {Schema} schema
 * @param {Document, Object} doc
 * @param {Function} callback
 */
function save(schema, doc, callback){
  logging.info('Saving %s in %s', doc, schema);

  callDriver('save', schema, toJSON(doc), callback);
}

/**
 * Return the content of given document as JSON
 *
 * @param {Document} doc
 * @return {Object}
 */
function toJSON( doc){

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
 * @param {Schema} schema
 * @param {Object} doc
 * @return {String}
 */
function toString(schema, doc){
  return JSON.stringify( toJSON(schema, doc) );
}

module.exports = {
  'find': find,
  'save': save,
  'newDocument': newDocument,
  'toJSON': toJSON,
  'toString': toString
};
