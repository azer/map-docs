map = require '../../'

DB = {}

coll = (name) ->
  if DB[name] == undefined
    DB[name] = {}
  DB[name]

find = (collName, query, callback) ->
  results = []

  return callback undefined, coll(collName) if query == undefined

  for key, record of coll(collName)
    matches = Object.keys(query).every (key) ->
      return record[key] == query[key]

    results.push record if matches

  callback undefined, results

generateKey = ->
  return Math.floor( Math.random() * 99999999999 ).toString 36

get = (collName, key, callback) ->
  callback undefined, coll(collName)[key]

reset = (collName, callback) ->
  DB[collName] = undefined
  callback()

remove = (collName, query, callback) ->
  if query == undefined
    return callback()

  if typeof query != 'object'
    delete coll(collName)[query]
    return callback()

  for key, value in coll(collName)
    matches = Object.keys(query).every (key) ->
      return el[key] != query[key]

    if matches
      delete DB[collName]

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
    reset: reset
    save: save
    toString: toString
  }
