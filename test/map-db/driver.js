/**
 * This module is an example driver that keeps data in only a JS object.
 * See the DB variable below.
 */

var DB = {};

function coll(name){
  !DB[name] && ( DB[name] = {} );
  return DB[name];
}

function find(collName, key, callback){
  callback(undefined, [coll(collName)[key]]);
}

function get(collName, key, callback){
  callback(undefined, coll(collName)[key]);
}

function idFieldName(){
  return 'pk';
}

function genkey(){
  return Math.floor( Math.random() * 99999999999 ).toString(36);
}

function save(collName, doc, callback){

  if(doc.pk == undefined){
    doc.pk = genkey();
  }

  coll(collName)[ doc.pk ] = doc;

  callback(undefined, doc.pk);
}

function remove(collName, key, callback){
  delete coll(collName)[key];
  callback();
}

function set(collName, key, rpl, callback){
  coll(collName)[key] = rpl;
  callback();
}

function toString(){
  return 'map-db';
};

module.exports = {
  'all': coll,
  'find': find,
  'idFieldName': idFieldName,
  'get': get,
  'save': save,
  'remove': remove,
  'set': set,
  'toString': toString
};
