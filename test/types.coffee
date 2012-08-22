highkick    = require 'highkick'
assert      = require 'assert'
map         = require '../'
throwsError = require './throws-error'

init = (options, callback) ->

  driver1 = map {}

  callback undefined, driver1.types

testAvailableTypes = (types, callback) ->
  assert.ok types
  assert.ok types.string
  assert.ok types.number
  assert.ok types.date
  assert.ok types.subschema
  assert.ok types.unixtime

  callback()

testString = (types, callback) ->

  types.string ''
  types.string 'foo'
  types.string 'foo', { min: 3, max: 3 }

  throwsError ->
    types.string 3

  throwsError ->
    types.string String

  throwsError ->
    types.string 314

  throwsError ->
    types.string 'foo', { max: 2 }

  throwsError ->
    types.string 'foo', { min: 4, max: 2 }

  throwsError ->
    types.string 'f', { min: 3 }

  throwsError ->
    types.string 'f', { min: 3, max: 5 }

  callback()

testNumber = (types, callback) ->
  types.number 3.14
  types.number 314
  types.number 0

  throwsError ->
    types.number 'foo'

  throwsError ->
    types.number '0'

  throwsError ->
    types.number Number

  callback()

testDate = (types, callback) ->
  types.date new Date

  assert.ok +( types.date(undefined, { auto: true }) ) > +(new Date) - 250
  assert.ok +( types.date('01.01.1970', { auto: true }) ) > +(new Date) - 250

  throwsError ->
    types.date 123

  callback()

testEmail = (types, callback) ->
  types.email 'foo@bar.com'
  types.email 'fo.o+oo_corge-123@ba.r.com'

  throwsError ->
    types.email 'foo'

  throwsError ->
    types.email 'foo @bar.com'

  throwsError ->
    types.email 'foo@ba r.com'

  callback()

testSubschema = (types, callback) ->
  driver1 = map {}
  schema1 = driver1 {
    foo : String
    bar : Number
  }

  valid1 = schema1 {
    foo : 'Hello'
    bar : 3
  }

  invalid1 = schema1 {
    foo : 'Invalid'
  }

  types.subschema valid1, { schema: schema1 }

  throwsError ->
    types.subschema invalid1, { schema: schema1 }

  callback()

testUnixTime = (types, callback) ->
  types.date new Date

  assert.ok types.unixtime(undefined, { auto: true }) > +(new Date) - 250
  assert.ok types.unixtime(0, { auto: true }) > +(new Date) - 250

  throwsError ->
    types.unixtime new Date

  callback()

module.exports =
  init               : init
  testAvailableTypes : testAvailableTypes
  testString         : testString
  testNumber         : testNumber
  testDate           : testDate
  testEmail          : testEmail
  testSubschema      : testSubschema
  testUnixTime       : testUnixTime
