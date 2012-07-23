var mapdb      = require('../map-db'),
    capitalize = require('./capitalize'),
    types      = mapdb.types;

var author = mapdb('authors', {
  'first_name': { 'type': types.string, 'set': capitalize },
  'last_name': { 'type': types.string, 'set': capitalize }
});

module.exports = author;
