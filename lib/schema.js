var prop    = require('./prop'),

    errors  = require('./errors'),
    types   = require('./types'),

    logging = require('./logging')('map'),

    slice   = Array.prototype.slice;

/**
 * Schema factory.
 *
 * @param {Driver} driver
 * @param {String} collection
 * @param {Object} rawFields
 * @return {Schema}
 */
function newSchema(driver, collection, rawFields){

  logging.info('Defining %s@%s schema.', collection, driver);

  var fields = fixSchemaFields(rawFields);

  function schema(){

    var args = Array.prototype.slice.call(arguments),
        fn;

    /**
     * Create a new document from given content.
     *
     * @param {Object} content
     * @return {Document}
     */
    if( args.length == 1 && typeof args[0] == 'object' ){
      fn = schema.create;
    }

    /**
     * Find documents by specified query
     *
     * @param {String, Number, Object} query
     * @param {Function} callback
     * @return {Document}
     */
    if( args.length == 2 && ( typeof args[0] == 'string' || typeof args[0] == 'number' || typeof args[0] == 'object' ) && typeof args[1] == 'function' ){
      fn = schema.find;
    }

    return fn.apply(undefined, args);
  }

  schema.driver     = driver;
  schema.collection = collection;
  schema.fields     = fields;

  schema.create     = newDocument.bind(undefined, schema);
  schema.find       = find.bind(undefined, schema);
  schema.insert     = insert.bind(undefined, schema);
  schema.get        = get.bind(undefined, schema);
  schema.save       = save.bind(undefined, schema);
  schema.remove     = remove.bind(undefined, schema);
  schema.set        = set.bind(undefined, schema);
  schema.validate   = validateDocument.bind(undefined, schema);

  schema.toString   = function(){
    return schema.collection + '@' + schema.driver;
  };

  return schema;
}

/**
 * Create a new document from given JSON content
 *
 * @param {Schema} schema
 * @param {Object} content
 * @return {Object}
 */
function newDocument(schema, content){

  var doc    = {},
      fields = Object.keys(schema.fields),
      key, value, options;

  logging.info('Creating a new %s document with given content "%s"', schema, JSON.stringify(content));

  var i = -1;

  while( ++i < fields.length ){

    key     = fields[i];
    options = schema.fields[key];

    if( options.schema && typeof content[key] == 'object' ){

      value = isDocument( content[key] ) ? content[key] : schema.fields[key].schema.create( content[key] );

    } else {

      value = content.hasOwnProperty(key)
        ? content[ key ]
        : options.hasOwnProperty('default') ? options.default : undefined;

      value = prop(schema, doc, key, value, options.get, options.set);
    }

    doc[ fixPropertyName(key) ] = value;

  }

  var id = idFieldName(schema);
  doc.id = prop(schema, doc, id, content[id]);

  return doc;
}


/**
 * Find documents by specified query
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function find(schema, query, callback){

  schema.driver.find(schema.collection, query, function(error, results){

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
 * Walk all given schema fields and return a new, fixed copy
 *
 * @param {Object} rawFields
 * @return {Object}
 */
function fixSchemaFields(rawFields){
  var fields = {}, key, value;

  for(key in rawFields){

    value = rawFields[ key ];

    if( isSchema( value ) ){
      value = { 'schema': value, 'type': types.subschema };
    }

    fields[ key ] = value;

  }

  return fields;
}

/**
 * Fix given property name if required.
 *
 * @param {String} name
 * @return {String}
 */
function fixPropertyName(name){
  return name
    .replace(/[^a-zA-Z0-9]+/g,' ')
    .replace(/^[\d\s]+/g,'').split(' ')
    .reduce(function(a,b){
      return a + b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
    });
}

/**
 * Return the name of ID field for the driver of specified schema.
 *
 * @param {Schema} schema
 * @return {String}
 */
function idFieldName(schema){
  return schema.driver.idFieldName && schema.driver.idFieldName() || 'id';
}


/**
 * Insert given doc(s) to collection.
 *
 * @param {Schema} schema
 * @param {Array, Document} docs
 * @param {Function} callback
 */
function insert(schema, docs, callback){

  logging.info('Inserting given docs %s to "%s".', JSON.stringify(docs), schema);

  !Array.isArray(docs) && ( docs = [docs] );


  try {
    docs.map(schema.validate);
  } catch(validationError) {
    logging.error(validationError);
    callback(validationError);
    return;
  }

  var result = [], doc;

  (function each(i){

    if( i >= docs.length ){
      callback(undefined, result);
      return;
    }

    doc = docs[i];

    // HERE

  }(0));


  schema.driver.insert(schema.collection, docs, function(error, results){

    if(error){
      callback(error);
      return;
    }

    if( !insertList ){
      callback(undefined, newDocument(schema, results));
      return;
    }

    callback(undefined, results.map(newDocument.bind(undefined, schema)));

  });
}

/**
 * Determine if given object is a document or not
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isDocument(obj){
  return Object.keys(obj)
    .some(function(key){
      return typeof obj[ key ] == 'function' && obj[key].hasOwnProperty('raw');
    });
}


/**
 * Determine if given object is a schema or not
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isSchema(obj){
  return obj && typeof obj.driver == 'object' && typeof obj.collection == 'string' && typeof obj.fields == 'object';
}

/**
 * Create and return a Schema Factory for specified driver
 *
 * @param {Driver} driver
 * @return {Function}
 */

function newDriver(driver){
  return newSchema.bind(undefined, driver);
};

/**
 * Return unix timestamp.
 *
 * @return {Number}
 */
function now(){
  return +(new Date);
}

/**
 * Take the first row of the records matching with specified query.
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function get(schema, query, callback){

  logging.info('Querying first record of %s', JSON.stringify(query));

  schema.driver.get(schema.collection, query, function(error, result){

    if(error){
      callback(error);
      return;
    }

    logging.debug('Found result for %s: "%s"', JSON.stringify(query), JSON.stringify(result));

    callback(undefined, result ? newDocument(schema, result) : undefined);

  });

}



/**
 * Remove the records matching with specified query.
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function remove(schema, query, callback){
  logging.info('Removing %s from %s', JSON.stringify(query), schema.collection);

  schema.driver.remove(schema.collection, query, callback);

}

/**
 * Save given document. Updates if already exists, inserts otherwise.
 *
 * @param {Schema} schema
 * @param {Document, Object} doc
 * @param {Function} callback
 */
function save(schema, doc, callback){
  var content = toJSON(schema, doc);

  logging.info('Saving %s in %s', JSON.stringify(content), schema.collection);

  try {
    content = validateDocument(schema, content);
  } catch( validationError ){
    logging.error(validationError);
    callback(validationError);
    return;
  }

  schema.driver.save(schema.collection, content, function(error, record){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, typeof record == 'object' ? create(schema, record) : true);

  });
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

  function remove(callback){
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
  add.remove  = remove;

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

  logging.trace('Synchronizing document %s with following update: %s', doc.id(), JSON.stringify(update));

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
 * Return the content of given schema document as JSON
 *
 * @param {Schema} schema
 * @param {Object} doc
 * @return {Object}
 */
function toJSON(schema, doc){

  var key, prop, value, field,
      result = {};

  for(key in schema.fields) {
    field = fixPropertyName(key);
    prop = doc[ field ];

    if( typeof prop == 'object' ){
      value = toJSON( schema.fields[ field ].schema, prop );
    } else {
      value = prop.raw();
    }

    result[key] = value;
  }

  result[ idFieldName(schema) ] = doc.id();

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

/**
 * Replace the records matching with given query, with specified replacement.
 *
 * @param {Schema} schema
 * @param {String, Number, Object} query
 * @param {Object} replacement
 * @param {Function} callback
 */
function set(schema, query, replacement, callback){
  logging.info('Setting %s in %s as %s', JSON.stringify(query), schema, JSON.stringify(toJSON(schema, replacement)));

  validateDocument(schema, replacement);

  schema.driver.set(schema.collection, query, toJSON(schema, replacement), function(error, result){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, result);

  });

}


/**
 * Update specified fields of given document.
 *
 * @param {Schema} Schema
 * @param {Document} Document
 * @param {Object} update
 */
function updateDocument(schema, document, update, callback){
  var field;

  for(field in update){
    document[ field ]( update[ field ] );
  }

  document.save(callback);
}


/**
 * Validate, and fix the content of given document if necessary.
 *
 * @param {Schema} schema
 * @param {Document} document
 * @return {Object}
 */
function validateDocument(schema, document){

  logging.info('%s is validating the document "%s"', schema, JSON.stringify(toJSON(schema, document)));

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
function validateField(schema, field, value){

  var options = schema.fields[field],
      typefn = typeof options == 'function' ? options : options && options.type;

  if( typeof typefn != 'function' ){
    throw errors.schemaFieldWithoutValidator(schema, field);
  }

  return typefn( schema, field, options, value );
}

module.exports            = newSchema;
module.exports.newDriver  = newDriver;
module.exports.isDocument = isDocument;
