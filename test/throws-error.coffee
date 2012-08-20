assert = require 'assert'

module.exports = (fn) ->
  try
    fn()
  catch error
    prodError = yes

  assert.ok prodError
