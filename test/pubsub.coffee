highkick = require 'highkick'
assert   = require 'assert'
map      = require '../lib'
arraydb  = require './array-db'

init = (options, callback) ->

  people = arraydb {
    name         : String,
    age          : Number,
    lastModified : { type: Date, auto: true }
  }

  callback undefined, people

testSubscription = (people, callback) ->

  joe = people {
    name: 'joe'
    age: 18
  }

  i = 0
  people.subscribe joe, (updatedFields) ->
    if i is 0

      try
        assert.deepEqual updatedFields, ['name', 'age']
      catch error
        assert.deepEqual updatedFields, ['age', 'name']

      return i++

    else
      assert.deepEqual updatedFields, ['name']

    assert.equal i, 1

    callback()

  joe.name 'fast joe'
  joe.age 19

  process.nextTick ->
    joe.name 'very, very fast joe'

testPublish = (people, callback) ->
  joe = people {
    name: 'joe'
    age: 18
  }

  people.subscribe joe, (updatedFields) ->

    try
      assert.deepEqual updatedFields, ['name', 'age']
    catch error
      assert.deepEqual updatedFields, ['age', 'name']

    callback()

  people.publish joe, {
    name: 'fast joe'
    age: 19
  }

testSubDocuments = ->

module.exports =
  init             : init
  testPublish      : testPublish
  testSubscription : testSubscription
