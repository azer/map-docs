var debug;

try {
  process.env.DEBUG.length;

  debug = require('debug');
  debug.level(process.env.LOG_LEVEL || 'info');

} catch (_) {

  debug = function debug(){ return debug; };

  var methods = ['info', 'trace', 'debug', 'error', 'fatal'],
      i       = methods.length;

  while( i -- ){
    debug[ methods[i] ] = debug;
  }

}

module.exports = debug;
