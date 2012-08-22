map = require '../../'

DB = {}

coll = (name) ->
  if DB[name] == undefined
    DB[name] = {}
  DB[name]

find = (collName, query, callback) ->
  results = []

  for key, record of DB[collName]
    matches = Object.keys(query).every (key) ->
      return record[key] == query[key]

    results.push record if matches

  callback undefined, results

generateKey = ->
  return Math.floor( Math.random() * 99999999999 ).toString 36

get = (collName, key, callback) ->
  callback undefined, coll(collName)[key]

reset = (collName, key, callback) ->


remove = (collName, key, callback) ->
  delete coll(collName)[key]
  callback()

save = (collName, doc, callback) ->

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
