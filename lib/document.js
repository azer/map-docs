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
 * Take the first row of the records matching with specified query, including the subdocuments.
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function get(schema, query, callback){

  logging.info('Getting %s from %s', query, schema);

  var document;

  schema.driver.get(schema.collection, query, function(error, result){

    if(error){
      callback(error);
      return;
    }

    if(!result){
      callback();
      return;
    }

    logging.debug('Found result for %s: "%s"', query, JSON.stringify(result));

    getChildren(schema, result, function(error, replacements){

      if(error){
        callback(error);
        return;
      }

      var key;
      for(key in replacements){
        logging.debug('Replacing the "%s" field with "%s"', key, replacements[key]);
        result[key] = replacements[key];
      }

      callback(undefined, schema.create(result));

    });

  });

}

/**
 * Fetch the contents of all subdocument fields and return in a new object
 *
 * @param {Object} obj
 * @param {Function} callback
 */
function getChildren(schema, obj, callback){

  var replacements = {}, subschema, id;

  function each(name, field, next){

    subschema = field.schema;
    id = obj[name];

    logging.debug('%s needs to be replaced with matching content from %s.', id, subschema);

    subschema.get(id, function(error, doc){

      if(error){
        callback(error);
        return;
      }

      replacements[name] = doc;

      next();

    });

  }

  function end(){
    callback(undefined, replacements);
  }

  loopSubSchemas(schema, each, end);
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
 * Remove the records matching with specified query.
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function remove(schema, query, callback){
  logging.info('Removing %s from %s', query, schema.collection);

  var document = isDocument(query) ? query : undefined;

  function each(key, field, next){

    logging.debug('Removing subdocument (%s) %s from %s', key, document && document[key], field.schema);

    if(document){
      field.schema.remove(document[key], next);
      return;
    }

    logging.debug('Remove function is provided a query, instead of document.');

    get(schema, query, function(error, result){

      if(error){
        next(error);
        return;
      }

      document = result;

      field.schema.remove(document[key], next);

    });

  };

  function end(error){

    if(error){
      callback(error);
      return;
    }

    logging.trace('Removing %s from %s', document, schema.collection);

    schema.driver.remove(schema.collection, document.id(), callback);
  }

  loopSubSchemas(schema, each, end);

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
 * Make sure the children documents and save the ones without IDs
 *
 * @param {Schema} schema
 * @param {Document} document
 * @param {Function} callback
 */
function saveChildren(schema, document, callback){

  var replacements = {}, subschema;

  function each(field, subdoc, next){

    subschema = subdoc.id.schema;

    save(subschema, subdoc, function(error, id){

      if (error) {
        callback(error);
        return;
      }

      replacements[field] = id;

      next();

    });

  }

  function end(){
    callback(undefined, replacements);
  }

  loopSubDocs(schema, document, each, end);

}

/**
 * Create and return a new subscription instance.
 *
 * @return {Function}
 */
function subscribe(){

  var callbacks = [];

  function add(callback){
    callbacks.push(callback);
  }

  function rm(callback){
    callbacks[ callbacks.indexOf(callback) ] = undefined;
  }

  function publish(){

    var args = slice.call(arguments);

    (function(i){

      if( i >= callbacks.length ){
        return;
      }

      process.nextTick(function(){
        callbacks[i].apply(undefined, args);;
      }, 0);

    }(0));
  }

  add.publish = publish;
  add.remove  = rm;

  return add;
}


/**
 * Syncs specified document with provided new content or backend if the second parameter is a function.
 *
 * @param {Schema} schema
 * @param {Document} doc
 * @param {Object, Function}
 */
function sync(schema, document){

  var callback = typeof arguments[2] == 'function' ? arguments[2] : undefined,
      content  = !callback ? arguments[2] : undefined;

  if(content){
    syncUpdate(schema, document, content);
  } else {
    syncCollection(schema, document, callback);
  }

}

/**
 * Synchronize specified document with given update.
 *
 * @param {Schema} schema
 * @param {Document} doc
 * @param {Object} update
 * @return {Document}
 */
function syncUpdate(schema, doc, update){

  logging.trace('Synchronizing document %s with following update: %s', doc.id(), update);

  var key;

  for( key in update ){

    if( ! schema.fields[ key ] ){
      logging.warn('Unknown document field "%s".', key);
      continue;
    }

    doc[ key ]( update[key] );
  }

  doc.sync.ts(now());

  return doc;
}

/**
 * Notify resource collection about updated document fields.
 *
 * @param {Schema} schema
 * @param {Document} doc
 * @param {Function} callback
 */
function syncCollection(schema, document, callback){
  document.save(callback);
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
