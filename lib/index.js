var schema   = require('./schema'),
    types    = require('./types'),
    document = require('./document'),
    logging  = require('./logging')('index'),
    id       = require('./id');

/**
 * Create and return a Schema Factory for specified driver
 *
 * @param {Driver} driver
 * @return {Function}
 */
function newDriver(impl){
  logging.info('Defining new driver: %s', impl);

  function driver(){
    return schema.newSchema.apply(undefined, [driver].concat(Array.prototype.slice.call(arguments, 0)));
  }

  driver.impl     = impl;
  driver.types    = types;
  driver.toString = impl.toString;

  return driver;
};

module.exports           = newDriver;
module.exports.newDriver = newDriver;
module.exports.schema    = schema;
module.exports.document  = document;
module.exports.types     = types;
module.exports.id        = id;

//module.exports.document = document;

/*module.exports.schema = require('./schema');

module.exports.errors = require('./errors');*/
