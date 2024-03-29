map = require '../../'
DB = []

clone = (obj) ->
  if typeof obj == 'object'
    JSON.parse( JSON.stringify(obj) )
  else
    obj

find = (query, callback) ->
  results = []

  return callback undefined, DB if query == undefined

  for el in DB
    matches = Object.keys(query).every (key) ->
      return el[key] == query[key]

    results.push el if matches

  callback undefined, results

get = (index, callback) ->
  callback undefined, clone DB[index]

reset = (callback) ->
  DB = []
  callback()

remove = (query, callback) ->
  if query == undefined
    DB = []
    return callback()

  if typeof query != 'object'
    DB[query] = undefined
    return callback()

  DB = DB.filter (el) ->
    return Object.keys(query).every (key) ->
      return el[key] != query[key]

  callback()

save = (obj, callback) ->
  if obj.index == undefined
    obj.index = DB.push(obj) - 1
  else
    DB[ obj.index ] = obj

  callback undefined, obj.index

toString = ->
  "array-db"

module.exports = map {
    find: find
    get: get
    idFieldName: 'index'
    remove: remove
    reset: reset
    save: save
    toString: toString
  }
