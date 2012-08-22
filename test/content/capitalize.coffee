module.exports = (str) ->
  if typeof str == 'string'
    str.replace /(^\w)|(\s\w)/g, (letter) ->
      letter.toUpperCase()
