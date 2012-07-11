var logging = require("./logging")('prop');

module.exports = function(document, field, initial, getter, setter){

  var value = initial;

  function prop(update){

    if( arguments.length > 0 ){

      logging.info('Updating "%s" field with "%s"', field, update);

      value = setter ? setter(document, field, value, update) : update;
    }

    return getter ? getter(document, field, value) : value;

  };

  function raw(){
    return value;
  }

  prop.raw = raw;

  return prop;

};
