map = require '../../lib'

DB = []

clone = (obj) ->
  if typeof obj == object
    JSON.parse( JSON.stringify(obj) )
  else
    obj

find = (query, callback) ->
  results = []

  for el in DB
    matches = Object.keys(query).every (key) ->
      return el[key] == query[key]

    results.push el if matches

  callback undefined, results

get = (index, callback) ->
  callback undefined, clone DB[index]

remove = (index, callback) ->
  DB[obj.index] = undefined
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
    save: save
    toString: toString
  }
