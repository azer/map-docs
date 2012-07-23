/**
 * This module is an example driver that keeps data in only a JS array.
 * See the DB variable below.
 */

var DB = {};

function coll(name){
  !DB[name] && ( DB[name] = [] );
  return DB[name];
}

function find(collName, id, callback){
  callback(undefined, [ coll(collName)[id] ]);
}

function get(collName, id, callback){
  callback(undefined, coll(collName)[id]);
}

function insert(collName, docs, callback){
  if( Array.isArray(docs) ){

    docs.forEach(function(doc){
      doc.id = coll(collName).push(doc) - 1;
    });

  } else {
    docs.id = coll(collName).push(docs) - 1;
  }

  callback(undefined, docs);
}

function remove(collName, id, callback){
  coll(collName)[id] = undefined;
  callback();
}

function save(collName, doc, callback){
  if( doc.id != undefined ){
    coll(collName)[ doc.id ] = doc;
    callback(undefined, doc);
  } else {
    insert(collName, doc, callback);
  }
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
  'insert': insert,
  'get': get,
  'save': save,
  'remove': remove,
  'set': set,
  'toString': toString
};
