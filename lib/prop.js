module.exports = function(model, field, initial, getter, setter){

  var value = initial;

  function prop(update){

    if( arguments.length > 0 ){
      value = setter ? setter(model, field, value, update) : update;
    }

    return getter ? getter(model, field, value) : value;

  };

  function raw(){
    return value;
  }

  prop.raw = raw;

  return prop;

};
