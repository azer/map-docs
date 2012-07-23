var logging = require("./logging")('prop');

module.exports = function(schema, document, field, initial, getter, setter){

  var value = undefined;

  function get(){
    return getter ? getter(document, field, value) : value;
  }

  function prop(update){

    if( arguments.length > 0 ){
      set(update);
    }

    return get();

  };

  function set(update){
    logging.debug('Setting the value of %s:%s/%s as "%s"',
                 field,
                 document.id && document.id() || '{new}',
                 schema,
                 update);

    value = setter ? setter(document, field, value, update) : update;
  }

  function raw(update){

    if( arguments.length ){
      value = update;
    }

    return value;
  }

  prop.raw = raw;

  set(initial);

  return prop;

};
