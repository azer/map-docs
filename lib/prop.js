module.exports = function(model, field, initial, getter, setter){

  var entry = initial;

  function prop(update){

    if( arguments.length > 0 ){
      entry = setter ? setter(model, field, entry, update) : update;
    }

    return getter ? getter(model, field, entry) : entry;

  };

  return prop;

};

