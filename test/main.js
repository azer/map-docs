var highkick = require('highkick'),
    map = require('../lib');

var testSchema       = highkick('./schema'),
    testTypes        = highkick('./types'),
    testDocument     = highkick('./document');

module.exports = {
  'testSchema': testSchema,
  'testTypes': testTypes,
  'testDocument': testDocument
};
