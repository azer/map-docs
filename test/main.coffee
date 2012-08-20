highkick     = require 'highkick'
assert       = require 'assert'

map          = require '../lib'
id           = require '../lib/id'

testSchema   = highkick './schema'
testDocument = highkick './document'
testTypes    = highkick './types'

testId = (callback) ->

  driver1 = map.newDriver({
    find: ->
    get: ->
    save: ->
    id: 'foo'
  })

  fields1 =
    foo: String
    bar: String

  assert.equal id(driver1), 'foo'

  callback()

module.exports =
  testId       : testId
  testDocument : testDocument
  testSchema   : testSchema
  testTypes    : testTypes
