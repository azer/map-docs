assert    = require 'assert'
functools = require 'functools'

map    = require '../lib'
book    = require './content/book'
arraydb = require './array-db'

author  = require './content/author'
mapdb   = require './map-db'

testNewDocument = (callback) ->

  driver1 = map {
    find: ->
    get: ->
    save: ->
    id: 'foo'
  }

  schema1 = driver1 {
    foo : String
    bar : String
  }

  doc1 = schema1 {
    foo: 'hello-world',
    bar: 'corge-quux'
  }

  doc2 = schema1 {
    foo: { 'a': 1 },
    bar: 3.14
  }

  assert.equal doc1.id(), 'hello-world'
  assert.equal doc1.foo(), 'hello-world'
  assert.equal doc1.bar(), 'corge-quux'

  assert.equal doc2.id().a, 1
  assert.equal doc2.foo().a, 1
  assert.equal doc2.bar(), 3.14

  assert.equal doc1.id.isDocument, true
  assert.equal doc1.id.schema, schema1

  callback()

testCreatingSubDocs = (callback) ->
  whitefang = book {
    index: 0
    title: 'white fang'
    author:
      key: 'jl'
      first_name: 'Jack'
      last_name: 'London'
  }

  ontheroad = book {
    index: 1
    title: 'on the road'
    author: author {
      key: 'jk'
      first_name: 'Jack'
      last_name: 'Kerouac'
    }
  }

  assert.equal whitefang.id(), 0
  assert.equal whitefang.title(), 'White Fang'
  assert.equal whitefang.author.id(), 'jl'
  assert.equal whitefang.author.firstName(), 'Jack'
  assert.equal whitefang.author.lastName(), 'London'

  assert.equal ontheroad.id(), 1
  assert.equal ontheroad.title(), 'On The Road'
  assert.equal ontheroad.author.id(), 'jk'
  assert.equal ontheroad.author.firstName(), 'Jack'
  assert.equal ontheroad.author.lastName(), 'Kerouac'

  callback()

testFind = (callback) ->
  whitefang = book {
    title: 'white fang'
    price: 5
  }

  ontheroad = book {
    title: 'on the road'
    price: 4
  }

  howl = book {
    title: 'howl'
    price: 4
  }

  functools.map.async book.save, [ whitefang, ontheroad, howl ], (error) ->
    return callback error if error

    book.find { price: 4 }, (error, results) ->

      assert.equal results.length 2

      callback()

testSave = (callback) ->
  whitefang = book {
    title: 'white fang',
    author: 'jl'
  }

  book.save whitefang, (error, id) ->
    console.log '-->', id
    callback()

testToJSON = (callback) ->
  callback new Error 'not implemented'


module.exports =
  testCreatingSubDocs : testCreatingSubDocs
  testFind            : testFind
  testNewDocument     : testNewDocument
  testSave            : testSave
  testToJSON          : testToJSON
