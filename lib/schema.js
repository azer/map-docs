var types    = require('./types'),
    logging  = require('./logging')('map'),
    document = require('./document'),
    slice    = Array.prototype.slice;

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
 * Iterate the fields defined as schemas of the given schema, asynchronously.
 *
 * @param {Schema} schema
 * @param {Function} each
 * @param {Function} end
 */
function loopSubSchemas(schema, each, end){
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

    if( schema.fields[ fields[i] ].type != types.subschema ){
      iter(i+1);
      return;
    }

    each(fields[i], schema.fields[fields[i]], iter.bind(undefined, i+1));

  }(0));

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

  schema.isSchema = true;
  schema.driver   = driver;
  schema.fields   = fields;
  schema.options  = options;

  schema.create     = document.newDocument.bind(undefined, schema);
  schema.find       = document.find.bind(undefined, schema);
  schema.save       = document.save.bind(undefined, schema);
/*
  schema.get        = get.bind(undefined, schema);

  schema.remove     = remove.bind(undefined, schema);
  schema.validate   = validateDocument.bind(undefined, schema);
  */

  schema.toString   = function(){
    return  '[' + schema.driver + ']';
  };

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
    }

    rewritten[ name ] = options;
  }

  return rewritten;
}

module.exports = {
  'isSchema': isSchema,
  'loopSubSchemas': loopSubSchemas,
  'newSchema': newSchema,
  'rewriteFieldOptions': rewriteFieldOptions
};
