var debug;

try {

  debug = require('debug');
  debug.level(process.env.LOG_LEVEL || 'info');

} catch (_) {

  debug = function debug(){ return debug; };

}

module.exports = debug;
