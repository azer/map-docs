map = require '../../lib'

DB = {}

coll = (name) ->
  if DB[name] == undefined
    DB[name] = {}
  DB[name]

find = (collName, query, callback) ->
  throw new Error 'Not Implemented'

generateKey = ->
  return Math.floor( Math.random() * 99999999999 ).toString 36

get = (collName, key, callback) ->
  callback undefined, coll(collName)[key]

remove = (collName, key, callback) ->
  delete coll(collName)[key]
  callback()

save = (collName, key, callback) ->

  if doc.key == undefined
    doc.key = generateKey()

  coll(collName)[ doc.key ] = doc

  callback undefined, doc.key

toString = ->
  'map-db'

module.exports = map {
    find: find
    get: get
    idFieldName: 'key'
    remove: remove
    save: save
    toString: toString
  }
