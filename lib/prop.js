var logging = require("./logging")('prop');

module.exports = function(document, rawValue, getter, setter){
  var value = undefined;

  function get(){
    return getter ? getter(value, document) : value;
  }

  function prop(update){

    if( arguments.length > 0 ){
      set(update);
    }

    return get();
  };

  function set(update){
    value = setter ? setter(update, value, document) : update;
  }

  function raw(update){
    if( arguments.length ){
      value = update;
    }

    return value;
  }

  prop.raw = raw;

  set(rawValue);

  return prop;
};
