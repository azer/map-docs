assert      = require 'assert'
functools   = require 'functools'

map         = require '../'
book        = require './content/book'
arraydb     = require './array-db'

author      = require './content/author'
mapdb       = require './map-db'

throwsError = require './throws-error'

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
    author: 1
    price: 4
  }

  howl = book {
    title: 'howl'
    author: 2
    price: 4
    tax: 50
  }

  asimov = author {
    firstName: 'isaac'
    last_name: 'asimov'
  }

  functools.map.async book.save, [ whitefang, ontheroad, howl ], (error) ->
    return callback error if error

    book.find (error, results) ->
      return callback error if error

      assert.ok results.length >= 3

      book.find { price: 4 }, (error, results) ->
        return callback error if error

        assert.equal results.length, 2

        assert.equal results[0].title(), 'On The Road'
        assert.equal results[0].author(), 1
        assert.equal results[0].price(), '$4.8'
        assert.equal results[0].price.raw(), 4
        assert.equal results[0].tax(), 20

        assert.equal results[1].title(), 'Howl'
        assert.equal results[1].author(), 2
        assert.equal results[1].price(), '$6'
        assert.equal results[1].price.raw(), 4
        assert.equal results[1].tax(), 50

        author.save asimov, (error, id) ->
          return callback error if error

          author.find { 'id': id }, (error, results) ->
            return callback error if error

            assert.equal results.length, 1

            assert.equal results[0].firstName(), 'Isaac'
            assert.equal results[0].lastName(), 'Asimov'

            book.remove (error) ->
              return callback error if error

              book.find (error, results) ->
                return callback error if error
                assert.equal results.length, 0

                callback()

testFindSubDocs = (callback) ->
  kerouac = author {
    firstName: 'jack'
    last_name: 'kerouac'
  }

  road = book {
    title: 'on the road'
    author: kerouac
    price: 4
    tax: 50
  }

  sea = book {
    title: 'the sea is my brother'
    author: kerouac
    price: 3
    tax: 50
  }

  functools.map.async book.save, [ road, sea ], (error) ->
    return callback error if error

    assert kerouac.id()
    assert road.id()
    assert sea.id()

    assert.equal road.author.id(), kerouac.id()
    assert.equal sea.author.id(), kerouac.id()

    book.find { tax: 50 }, (error, results) ->
      return callback error if error

      assert.equal results.length, 2
      assert.equal results[0].id(), road.id()
      assert.equal results[0].author(), kerouac.id()
      assert.equal results[1].id(), sea.id()

      callbac()

testGet = (callback) ->
  whitefang = book {
    title: 'white fang',
    author: 'jl'
  }

  book.save whitefang, (error, id) ->
    return callback error if error

    book.get id, (error, copy) ->
      return callback error if error

      assert.equal copy.id(), id
      assert.equal copy.title(), 'White Fang'
      assert.equal copy.author(), 'jl'

      callback()

testGetSubDocs = (callback) ->
  callback new Error 'No Implemented'

testProperties = (callback) ->
  schema1 = arraydb {
    name: String,
    greeting: (doc) -> "Hello #{doc.name()}!"
  }

  document = schema1 {
    'name': 'jack'
  }

  assert.equal document.greeting(), 'Hello jack!'
  callback()

testRemove = (callback) ->
  whitefang = book {
    title: 'white fang',
    author: 'jl'
  }

  asimov = author {
    firstName: 'isaac'
    last_name: 'asimov'
  }

  book.save whitefang, (error) ->
    return callback error if error

    wfid = whitefang.id()

    author.save asimov, (error) ->
      return callback error if error

      iaid = asimov.id()

      book.remove whitefang, (error) ->
        return callback error if error

        assert.equal whitefang.id(), undefined

        book.get wfid, (error, nonexisting) ->
          return callback error if error

          assert.equal nonexisting, undefined

          author.remove asimov, (error) ->
            return callback error if error

            assert.equal asimov.id(), undefined

            book.get iaid, (error, nonexisting) ->
              return callback error if error

              assert.equal nonexisting, undefined

              callback()

testRemoveByQueries = (callback) ->
  callback new Error 'Not Implemented'

testRemoveSubDocs = (callback) ->
  callback new Error 'No Implemented'

testSave = (callback) ->
  whitefang = book {
    title: 'white fang',
    author: 'jl'
  }

  asimov = author {
    firstName: 'isaac'
    last_name: 'asimov'
  }

  book.save whitefang, (error, id) ->
    return callback error if error

    assert.notEqual id, undefined
    assert.equal id, whitefang.id()

    author.save asimov, (error, id) ->
      return callback error if error
      assert.notEqual id, undefined
      assert.equal id, asimov.id()

      callback()

testSaveSubDocs = (callback) ->
  kerouac = author {
    firstName: 'jack'
    last_name: 'kerouac'
  }

  road = book {
    title: 'on the road'
    author: kerouac
    price: 4
    tax: 50
  }

  book.save road, (error) ->
    return callback error if error

    assert road.id()
    assert kerouac.id()

    assert.equal road.author.id(), kerouac.id()

    callback()


testValidation = (callback) ->

  driver1 = map {}

  schema1 = driver1 {
    foo : String,
    bar : Number,
    qux : { type: Date, auto: true }
  }

  doc1 = schema1 {
    foo: 'hello-world'
    bar: 123
  }

  schema1.validate doc1

  assert.ok doc1.qux()
  assert.ok +(doc1.qux()) > +(new Date)-250

  doc2 = schema1 {
    foo: 'foo'
  }

  throwsError ->
    schema1.validate doc2

  callback()

testToJSON = (callback) ->

  foo = arraydb {
    bar: String
    qux: ->
  }

  corge = foo {
    bar: 'BAR'
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

  content = book.toJSON ontheroad
  fields  = Object.keys content

  assert.equal fields.length, 5
  assert.equal content.title, 'On The Road'
  assert.equal content.author.first_name, 'Jack'
  assert.equal content.author.last_name, 'Kerouac'
  assert.equal content.price, 5
  assert.equal content.tax, 20

  content = foo.toJSON corge

  assert.equal content.bar, 'BAR'
  assert not content.hasOwnProperty 'qux'

  callback()

module.exports =
  testCreatingSubDocs : testCreatingSubDocs
  #testFindSubDocs    : testFindSubDocs
  testFind            : testFind
  testGet             : testGet
  testNewDocument     : testNewDocument
  testProperties      : testProperties
  testSave            : testSave
  testRemove          : testRemove
  testToJSON          : testToJSON
  testValidation      : testValidation
