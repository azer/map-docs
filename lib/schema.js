var prop    = require('./prop'),
    errors  = require('./errors'),
    logging = require('./logging')('map'),

    slice   = Array.prototype.slice;

/**
 * Schema factory.
 *
 * @param {Driver} driver
 * @param {String} collection
 * @param {Object} fields
 * @return {Schema}
 */
function construct(driver, collection, fields){

  function schema(){}

  schema.driver     = driver;
  schema.collection = collection;
  schema.fields     = fields;

  schema.create     = create.bind(undefined, schema);
  schema.find       = find.bind(undefined, schema);
  schema.insert     = insert.bind(undefined, schema);
  schema.one        = one.bind(undefined, schema);
  schema.save       = save.bind(undefined, schema);
  schema.remove     = remove.bind(undefined, schema);
  schema.update     = update.bind(undefined, schema);
  schema.validate   = validateContent.bind(undefined, schema);

  return schema;
}

/**
 * Create a new document from given JSON content
 *
 * @param {Schema} schema
 * @param {Object} content
 * @return {Object}
 */
function create(schema, content){
  var doc     = {},
      key, idFieldName, options;

  logging.info('Mapping given content "%s" to a new document object.', JSON.stringify(content));

  for( key in schema.fields ){
    options = schema.fields[key];
    doc[ key ] = prop(doc, key, content[ key ], options.get, options.set);
  };

  idFieldName     = schema.driver.idFieldName && schema.driver.idFieldName() || 'id';
  logging.debug('Determined ID Field for %s is; %s', schema.collection, idFieldName);

  doc[ 'id' ]     = prop(doc, key, content[ idFieldName ]);

  doc.update      = updateDocument.bind(undefined, schema, doc);
  doc.save        = save.bind(undefined, schema, doc);
  doc.remove      = remove.bind(undefined, schema, doc.id());
  doc.toJSON      = toJSON.bind(undefined, schema, doc);

  doc.sync        = sync.bind(undefined, schema, doc);
  doc.sync.ts     = prop(doc, 'sync.ts', now());

  doc.subscribe   = subscribe();
  doc.publish     = doc.subscribe.publish;
  doc.unsubscribe = doc.subscribe.remove;

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
      return create(schema, el);
    }));

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
 * @param {Array, Object} docs
 * @param {Function} callback
 */
function insert(schema, docs, callback){

  logging.info('Inserting given docs %s to specified schema "%s".', JSON.stringify(docs), schema.collection);

  var insertList = Array.isArray(docs);

  try {

    if(insertList){
      docs = docs.map(toJSON.bind(undefined, schema)).map(schema.validate);
    } else {
      docs = schema.validate(toJSON(schema, docs));
    }

  } catch(validationError) {
    logging.error(validationError);
    callback(validationError);
    return;
  }

  schema.driver.insert(schema.collection, docs, function(error, results){

    if(error){
      callback(error);
      return;
    }

    if( !insertList ){
      callback(undefined, create(schema, results));
      return;
    }

    callback(undefined, results.map(create.bind(undefined, schema)));

  });
}

/**
 * Determine if given object is a document or not
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isDocument(obj){
  return obj && typeof obj.toJSON == 'function';
}

/**
 * Create and return a Schema Factory for specified driver
 *
 * @param {Driver} driver
 * @return {Function}
 */

function newDriver(driver){
  return construct.bind(undefined, driver);
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
function one(schema, query, callback){

  logging.trace('Querying first record of %s', JSON.stringify(query));

  schema.driver.one(schema.collection, query, function(error, result){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, result ? create(schema, result) : undefined);

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
    content = validateContent(schema, content);
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

  if( !isDocument(doc) ){
    return doc;
  }

  var key, result = {};

  for(key in schema.fields){
    result[ key ] = doc[key].raw();
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
function update(schema, query, replacement, callback){
  replacement = toJSON(schema, replacement);

  logging.info('Replacing %s in %s with %s', JSON.stringify(query), schema.collection, JSON.stringify(replacement));

  replacement = validateContent(schema, replacement);

  schema.driver.update(schema.collection, query, replacement, function(error, result){

    if(error){
      callback(error);
      return;
    }

    callback();

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
    throw errors.invalidSchemaField(schema, field);
  }

  return typefn( schema, field, options, value );
}

/**
 * Validate, and fix the value of given data if necessary.
 *
 * @param {Schema} schema
 * @param {Object} content
 * @return {Object}
 */
function validateContent(schema, content){

  var result  = {},
      idfield = idFieldName(schema),
      field;

  for( field in schema.fields ){
    result[field] = validateField(schema, field, content[ field ]);
  }


  result[ idfield ] = content[ idfield ];

  return result;
}

module.exports            = construct;
module.exports.newDriver  = newDriver;
module.exports.isDocument = isDocument;
