var debug;

try {
  process.env.DEBUG.length;

  debug = require('debug');
  debug.level(process.env.LOG_LEVEL || 'info');

} catch (_) {

  debug = function debug(){ return debug; };

}

module.exports = debug;
