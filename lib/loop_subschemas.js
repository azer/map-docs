var types = require('./types');

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

module.exports = loopSubSchemas;
