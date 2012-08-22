assert  = require 'assert'
map     = require '../'

book    = require './content/book'
arraydb = require './array-db'

author  = require './content/author'
mapdb   = require './map-db'

testCustomMethods = (callback) ->
  shouldBeIgnored = ->

  foo = (option1, option2, doc, callback) ->
    assert.equal option1, 'span'
    assert.equal option2, 'eggs'
    assert doc.isDocument
    callback()

  driver1 = map {
    find     : -> shouldBeIgnored
    get      : -> shouldBeIgnored
    foo      : foo
    qux      : -> 'corge'
    toString :  -> 'driver1'
  }

  schema1 = driver1 'span', 'eggs', {}

  assert.equal schema1.qux(), 'corge'
  assert.notEqual schema1.find, shouldBeIgnored
  assert.notEqual schema1.get, shouldBeIgnored

  schema1.foo { isDocument: true }, callback

testDefinition = (callback) ->
  assert.equal book.isSchema, true
  assert.equal book.driver, arraydb
  assert.deepEqual Object.keys(book.fields), ['title', 'author', 'price', 'tax']

  callback()

testIsSchema = (callback) ->
  assert.ok map.schema.isSchema(book)
  assert.ok not map.schema.isSchema({})

  callback()

testLoopSubSchemas = (callback) ->
  calledEach = no

  each = (name, field, next) ->
    assert.equal name, 'author'
    assert.equal field.type, arraydb.types.subschema
    assert.equal field.schema, author

    calledEach = yes
    next()

  end = (error) ->
    return callback error if error

    assert.ok calledEach
    callback()

  map.schema.loopSubSchemas book, each, end

testNewSchema = (callback) ->
  driver1 = map.newDriver {
    find: ->
    get: ->
    save: ->
  }

  fields1 =
    foo: String
    bar: String

  schema1 = map.schema.newSchema driver1, fields1

  schema2 = driver1 'option1', 'option2', 3.14, {
    foo: Number,
    bar: Number
  }

  assert.equal schema1.isSchema, true
  assert.equal schema1.driver, driver1
  assert.deepEqual schema1.options, []
  assert.deepEqual Object.keys(schema1.fields), ['foo', 'bar']

  assert.equal schema2.isSchema, true
  assert.equal schema2.driver, driver1
  assert.deepEqual schema2.options, ['option1', 'option2', 3.14]
  assert.deepEqual Object.keys(schema2.fields), ['foo', 'bar']

  callback()

testRewriteFieldOptions = (callback) ->
  subschema = { 'isSchema': true }
  greeting  = -> "hello!"

  options1 =
    title: { type: String, min: 2, max: 255 }
    greeting: greeting
    content: String
    lastModifiedTS: Date

  options2 =
    title: String
    rel: subschema

  rewritten1 = map.schema.rewriteFieldOptions options1
  rewritten2 = map.schema.rewriteFieldOptions options2

  assert.equal rewritten1.title.type, map.types.string
  assert.equal rewritten1.title.min, 2
  assert.equal rewritten1.title.max, 255
  assert.equal rewritten1.greeting, greeting

  assert.equal rewritten1.content.type, map.types.string

  assert.equal rewritten1.lastModifiedTS.type, map.types.date

  assert.equal rewritten2.title.type, map.types.string
  assert.equal rewritten2.rel.type, map.types.subschema
  assert.equal rewritten2.rel.schema, subschema

  callback()

module.exports =
  testCustomMethods       : testCustomMethods
  testDefinition          : testDefinition
  testIsSchema            : testIsSchema
  testLoopSubSchemas      : testLoopSubSchemas
  testNewSchema           : testNewSchema
  testRewriteFieldOptions : testRewriteFieldOptions
