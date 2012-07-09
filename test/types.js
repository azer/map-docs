var assert = require('assert'),
    map    = require('../lib'),
    book   = require('./book'),
    types  = map.types;

function testNumber(callback){
  assert.throws(function(){ types.number(book, 'test', null, 'foo'); });
  assert.equal(types.number(book, 'test', null, 3.14), 3.14);
  callback();
}

function testString(callback){
  assert.throws(function(){ types.string(book, 'test', null, 3.14); });
  assert.equal(types.string(book, 'test', null, 'foo'), 'foo');
  callback();
}

function testTS(callback){
  assert.ok( types.ts(book, 'test') > +(new Date)-100 );
  assert.ok( types.ts(book, 'test', { 'auto': true }, +(new Date)-500) > +(new Date)-100 );
  assert.ok( types.ts(book, 'test', null, +(new Date)) > +(new Date)-100 );
  callback();
}

module.exports = {
  'testNumber': testNumber,
  'testString': testString,
  'testTS': testTS
};
