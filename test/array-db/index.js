var map    = require('../../lib'),
    driver = require('./driver'),
    types  = require('./types');

module.exports = map.newDriver(driver);
module.exports.types = types;
module.exports.errors = map.errors;
