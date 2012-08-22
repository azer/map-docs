highkick     = require 'highkick'
assert       = require 'assert'

map          = require '../'

testSchema   = highkick './schema'
testDocument = highkick './document'
testTypes    = highkick './types'

testNewDriver = (callback) ->
  driver1 = map.newDriver {
    get: ->
    save: ->
    foo: ->
    bar: ->
    id: 'foo'
  }

  assert.ok driver1.impl
  assert.ok driver1.impl.get
  assert.ok driver1.impl.save
  assert.ok driver1.impl.foo
  assert.ok driver1.impl.bar

  assert.ok driver1.types
  assert.ok driver1.types.number
  assert.ok driver1.types.string

  assert.ok driver1.toString

  callback()

testId = (callback) ->

  driver1 = map.newDriver {
    id: 'foo'
  }

  driver2 = map.newDriver {
    idFieldName: 'foo'
  }

  assert.equal map.id(driver1), 'foo'
  assert.equal map.id(driver2), 'foo'

  callback()

module.exports =
  testId        : testId
  testNewDriver : testNewDriver
  testDocument  : testDocument
  testSchema    : testSchema
  testTypes     : testTypes
