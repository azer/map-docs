/**
 * This module is an example driver that keeps data in only a JS array.
 * See the DB variable below.
 */

var DB = {};

function clone(obj){
  return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
}

function coll(name){
  !DB[name] && ( DB[name] = [] );
  return DB[name];
}

function find(collName, id, callback){
  callback(undefined, [ coll(collName)[id] ]);
}

function get(collName, id, callback){
  callback(undefined, clone(coll(collName)[id]));
}

function remove(collName, id, callback){
  coll(collName)[id] = undefined;
  callback();
}

function save(collName, doc, callback){
  if(doc.id == undefined){
    doc.id = coll(collName).push(doc) - 1;
  } else {
    coll(collName)[doc.id] = doc;
  }

  callback(undefined, doc.id);
}

function set(collName, id, rpl, callback){
  coll(collName)[id] = rpl;
  callback();
}

function toString(){
  return 'array-db';
};

module.exports = {
  'all': coll,
  'find': find,
  'get': get,
  'save': save,
  'remove': remove,
  'set': set,
  'toString': toString
};
