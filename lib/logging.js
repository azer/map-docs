var debug = require('debug');

debug.level(process.env.LOG_LEVEL || 'info');

module.exports = debug;
