var prop    = require('./prop'),
    errors  = require('./errors'),
    logging = require('./logging')('map');


/**
 * Schema factory.
 *
 * @param {Driver} driver
 * @param {String} collection
 * @param {Object} fields
 * @return {Schema}
 */
function construct(driver, collection, fields){

  function schema(){
  }

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
  schema.validate   = validateData.bind(undefined, schema);

  return schema;
}

/**
 * Create a new schema object
 *
 * @param {Object} schema
 * @param {Object} content
 * @return {Object}
 */
function create(schema, content){
  var doc = {},
      key, id, options;

  for( key in schema.fields ){
    options = schema.fields[key];
    doc[ key ] = prop(doc, key, content[ key ], options.get, options.set);
  }

  id = docID(schema, content);
  id != undefined && ( doc.id = prop(schema, key, id) );

  doc.save = save.bind(undefined, schema, doc);
  // doc.update = insert.bind(undefined, schema, id, doc)
  doc.remove = remove.bind(undefined, schema, id);

  return doc;
}


/**
 * Find data by specified query
 *
 * @param {Object} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function find(schema, query, callback){

  schema.driver.find(schema.collection, query, function(error, results){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, results && results.map(function(el){
      return create(schema, el);
    }));

  });

}

/**
 * Return the ID value of given document
 *
 * @param {Object} schema
 * @param {Object} doc
 * @return {Number, String}
 */
function docID(schema, doc){
  return doc[ idFieldName(schema) ];
}

/**
 * Return the name of ID field.
 *
 * @param {Object} schema
 * @return {String}
 */
function idFieldName(schema){
  return schema.driver.ID_FIELD_NAME || 'id';
}

/**
 * Insert given doc(s) to collection.
 *
 * @param {Object} schema
 * @param {Array, Object} docs
 * @param {Function} callback
 */
function insert(schema, docs, callback){

  try {

    if( !Array.isArray(docs) ){
      docs = validateData(schema, docs);
    } else {
      docs = docs.map(function(doc){
        return validateData(schema, doc);
      });
    }

  } catch( validationError ){
    logging.error( validationError );
    callback(validationError);
    return;
  }

  schema.driver.insert(schema.collection, docs, function(error, results){

    if(error){
      callback(error);
      return;
    }

    if( !Array.isArray( results ) ){
      callback(undefined, create(schema, results));
      return;
    }

    callback(undefined, results.map(create.bind(undefined, schema)));

  });
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
 * Take the first row of the records matching with specified query.
 *
 * @param {Object} schema
 * @param {String, Number, Object} query
 * @param {Function} callback
 */
function one(schema, query, callback){

  logging.trace('Querying first record of %s', JSON.stringify(query));

  schema.driver.find(schema.collection, query, function(error, result){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, result.length && result[0] ? create(schema, result[0]) : undefined);

  });

}

/**
 * Remove the records matching with specified query.
 *
 * @param {Object} schema
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
 * @param {Object} schema
 * @param {Object} doc
 * @param {Function} callback
 */
function save(schema, doc, callback){
  logging.info('Saving %s in %s', JSON.stringify(doc), schema.collection);

  try {
    doc = validateData(schema, doc);
  } catch( validationError ){
    logging.error( validationError );
    callback(validationError);
    return;
  }

  schema.driver.save(schema.collection, doc, function(error, record){

    if(error){
      callback(error);
      return;
    }

    callback(undefined, typeof record == 'object' ? create(schema, record) : true);

  });
}

/**
 * Replace the records matching with given query, with specified replacement.
 *
 * @param {Object} schema
 * @param {String, Number, Object} query
 * @param {Object} replacement
 * @param {Function} callback
 */
function update(schema, query, replacement, callback){
  logging.info('Replacing %s in %s with %s', JSON.stringify(query), schema.collection, JSON.stringify(replacement));

  replacement = validateData(schema, replacement);

  schema.driver.update(schema.collection, query, replacement, function(error, result){

    if(error){
      callback(error);
      return;
    }

    callback();

  });

}

/**
 * Validate, and fix the value of given schema field if necessary.
 *
 * @param {Object} schema
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
 * @param {Object} schema
 * @param {Object} data
 * @return {Object}
 */
function validateData(schema, data){

  var result = {},
      id     = docID(schema, data),
      field;

  for( field in schema.fields ){
    result[field] = validateField(schema, field, data[ field ]);
  }

  id != undefined && ( result[ idFieldName(schema) ] = id );

  return result;
}

module.exports = construct;
module.exports.newDriver = newDriver;
