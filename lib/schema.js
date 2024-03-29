var types    = require('./types'),
    logging  = require('./logging')('schema'),
    document = require('./document'),
    pubsub   = require('./pubsub'),
    slice    = Array.prototype.slice;

module.exports = {
  'isSchema': isSchema,
  'newSchema': newSchema,
  'rewriteFieldOptions': rewriteFieldOptions
};

/**
 * Determine if given object is a schema or not
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isSchema(obj){
  return !!( obj && obj.isSchema );
}

/**
 * Define a new schema.
 *
 * @param {DriverImpl} impl
 * @param {Object} rawFields
 * @return {Schema}
 */
function newSchema(driver /*[, options... ], rawFields */){
  logging.info('Creating new schema. Driver: %s', driver);

  var rawFields = arguments[ arguments.length - 1 ],
      options   = slice.call(arguments, 1, arguments.length - 1),
      fields    = rewriteFieldOptions(rawFields);

  function schema(){
    var args = slice.call(arguments),
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
    if( args.length == 2 && typeof args[1] == 'function' ){
      fn = schema.get;
    }

    return fn.apply(undefined, args);
  }

  schema.isSchema  = true;
  schema.driver    = driver;
  schema.fields    = fields;
  schema.options   = options;

  schema.create      = document.newDocument.bind(undefined, schema);
  schema.find        = document.find.bind(undefined, schema);
  schema.get         = document.get.bind(undefined, schema);
  schema.publish     = pubsub.publish;
  schema.save        = document.save.bind(undefined, schema);
  schema.subscribe   = pubsub.subscribe;
  schema.remove      = document.remove.bind(undefined, schema);
  schema.unsubscribe = pubsub.unsubscribe;
  schema.toJSON      = document.toJSON;
  schema.validate    = document.validate.bind(undefined, schema);

  schema.toString   = function(){
    return  '+' + schema.driver;
  };

  var method, params;
  for(method in driver.impl){
    if( typeof driver.impl[method] == 'function' && !schema.hasOwnProperty(method) ){
      !params && ( params = [undefined].concat(options) );
      logging.debug('Setting custom schema method %s ', driver, method);
      schema[method] = Function.prototype.bind.apply(driver.impl[method], params);
    }
  }

  return schema;
}



/**
 * Walk all the fields of given schema and return a new object with properly rewritten field options
 *
 * @param {Object} rawFields
 * @return {Object}
 */
function rewriteFieldOptions(rawFields){
  var rewritten = {}, name, options;

  for(name in rawFields){
    options = rawFields[ name ];

    if( ! options.hasOwnProperty('type') ){
      options = { 'type': options };
    }

    if( isSchema( options.type ) ){
      options = { 'schema': options.type, 'type': types.subschema };
    } else if( options.type == String ){
      options.type = types.string;
    } else if( options.type == Number ){
      options.type = types.number;
    } else if( options.type == Date ){
      options.type = types.date;
    } else if( typeof options.type == 'function' ){
      options = options.type;
    }

    rewritten[ name ] = options;
  }

  return rewritten;
}
