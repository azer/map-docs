assert      = require 'assert'
functools   = require 'functools'

map         = require '../'
book        = require './content/book'
arraydb     = require './array-db'

author      = require './content/author'
mapdb       = require './map-db'

throwsError = require './throws-error'

beforeEach = (callback) ->
  book.reset ->
    author.reset callback


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

  ontheroad = book {
    index: 1
    title: 'on the road'
    author: {
      key: 'jk'
      first_name: 'Jack'
      last_name: 'Kerouac'
    }
  }

  assert.equal ontheroad.id(), 1
  assert.equal ontheroad.title(), 'On The Road'
  assert.equal ontheroad.author.id(), 'jk'
  assert.equal ontheroad.author.firstName(), 'Jack'
  assert.equal ontheroad.author.lastName(), 'Kerouac'

  callback()

testFieldAccessors = (callback) ->
  whitefang = book {
    title: 'white fang',
    price: '$10'
  }

  assert.equal whitefang.price.raw(), 10
  assert.equal whitefang.title(), 'White Fang'

  callback()

testFind = (callback) ->
  whitefang = book {
    title: 'white fang'
    author: 1,
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

testFindById = (callback) ->
  whitefang = book {
    title: 'white fang'
    author: 1,
    price: 5
  }

  book.save whitefang, (error) ->
    return callback error if error

    book.find { 'id': whitefang.id() }, (error, result) ->

      assert not error
      assert.equal result.length, 1
      assert.equal whitefang.id(), result[0].id()
      assert.equal result[0].title(), 'White Fang'

      book.find whitefang.id(), (error, result) ->

        assert not error
        assert.equal result.length, 1
        assert.equal whitefang.id(), result[0].id()
        assert.equal result[0].title(), 'White Fang'

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

  author.save kerouac, (error) ->
    return callback error if error

    assert kerouac.id()

    functools.map.async book.save, [ road, sea ], (error) ->
      return callback error if error

      assert kerouac.id()
      assert road.id() > -1
      assert sea.id() > -1

      assert.equal road.author.id(), kerouac.id()
      assert.equal sea.author.id(), kerouac.id()

      book.find { tax: 50 }, (error, results) ->
        return callback error if error

        assert.equal results.length, 2
        assert.equal results[0].id(), road.id()
        assert.equal results[0].author(), kerouac.id()
        assert.equal results[1].id(), sea.id()

        callback()

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
      assert.equal copy.author(), undefined

      callback()


testGetSubDocs = (callback) ->
  schema1 = arraydb {
    foo: Number
  }

  schema2 = mapdb 'schema2', {
    bar: Number
    qux: schema1
  }

  schema3 = arraydb {
    corge: Number
    span: schema2
  }

  doc1 = schema3 {
    corge: 3.14
    span: schema2 {
      bar: 159
      qux: schema1 {
        foo: 265
      }
    }
  }

  schema3.save doc1, (error) ->
    return callback error if error

    assert doc1.id() > -1
    assert doc1.span.id()
    assert doc1.span.qux.id() > -1

    schema3.get doc1.id(), (error, copy) ->
      return callback error if error

      assert copy.id() > -1
      assert copy.span.id()
      assert copy.span.qux.id() > -1

      callback()

testLoopSubDocs = (callback) ->
  ontheroad = book {
    index: 1
    title: 'on the road'
    author: author {
      key: 'jk'
      first_name: 'jack'
      last_name: 'kerouac'
    }
  }

  calledEach = no

  each = (name, doc, next) ->
    assert.equal name, 'author'
    assert.equal doc.firstName(), 'Jack'
    assert.equal doc.lastName(), 'Kerouac'

    calledEach = yes
    next()

  end = (error) ->
    return callback error if error

    assert.ok calledEach
    callback()

  map.document.loopSubDocs ontheroad, each, end

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
  ontheroad = book {
    title: 'on the road'
    author: 'jk'
  }

  whitefang = book {
    title: 'white fang',
    author: 'jl'
  }

  asimov = author {
    firstName: 'isaac'
    last_name: 'asimov'
  }

  functools.map.async book.save, [ whitefang, ontheroad ], (error) ->
    return callback error if error

    wfid = whitefang.id()

    author.save asimov, (error) ->
      return callback error if error

      iaid = asimov.id()

      book.remove whitefang.id(), (error) ->
        return callback error if error

        book.get wfid, (error, nonexisting) ->
          return callback error if error

          assert.equal nonexisting, undefined

          book.get ontheroad.id(), (error, otr) ->

            assert not error
            assert otr

            author.remove asimov, (error) ->
              return callback error if error

              assert.equal asimov.id(), undefined

              author.get iaid, (error, nonexisting) ->
                return callback error if error

                assert.equal nonexisting, undefined

                callback()

testRemoveByQuery = (callback) ->
  whitefang = book {
    title: 'white fang'
    author: 1,
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

  functools.map.async book.save, [ whitefang, ontheroad, howl ], (error) ->
    return callback error if error

    book.remove { price: 4 }, (error, results) ->
      return callback error if error

      book.get whitefang.id(), (error, wf) ->

        assert not error
        assert wf

        book.find { price: 4 }, (error, results) ->
          return callback error if error

          assert.equal results.length, 0

          callback()

testRemoveSubDocs = (callback) ->
  whitefang = book {
    title: 'white fang'
    author: author {
      firstName: 'jack'
      lastName: 'london'
    }
  }

  book.save whitefang, (error) ->
    return callback error if error

    assert whitefang.id() > -1
    assert whitefang.author.id()

    book.remove whitefang, (error) ->
      return callback error if error

      book.get whitefang.id(), (error, wfcopy) ->
        return callback error if error

        assert.equal wfcopy, undefined

        author.get whitefang.author.id(), (error, jlcopy) ->
          return callback error if error

          assert.equal jlcopy, undefined

          callback()

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

testSaveValidation = (callback) ->
  valid1 = book {
    title: 'foo'
    author: 'bar'
    price: '$10'
  }

  invalid1 = book {
    title: 123,
    author: 'bar'
  }

  book.save valid1, (error) ->
    assert not error

    assert.equal valid1.price.raw(), 10

    book.save invalid1, (error) ->
      assert.equal error.name, 'ValidationError'
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

    assert.notEqual road.id(), undefined
    assert.notEqual kerouac.id(), undefined

    assert.equal road.author.id(), kerouac.id()

    author.get kerouac.id(), (error, kerouacCopy) ->
      return callback error if error

      assert.equal kerouacCopy.id(), kerouac.id()

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

module.exports =
  beforeEach          : beforeEach
  testCreatingSubDocs : testCreatingSubDocs
  testFind            : testFind
  testFindById        : testFindById
  testFindSubDocs     : testFindSubDocs
  testFieldAccessors  : testFieldAccessors
  testGet             : testGet
  testGetSubDocs      : testGetSubDocs
  testLoopSubDocs     : testLoopSubDocs
  testNewDocument     : testNewDocument
  testProperties      : testProperties
  testRemove          : testRemove
  testRemoveSubDocs   : testRemoveSubDocs
  testRemoveByQuery   : testRemoveByQuery
  testSave            : testSave
  testSaveValidation  : testSaveValidation
  testSaveSubDocs     : testSaveSubDocs
  testToJSON          : testToJSON
  testValidation      : testValidation
