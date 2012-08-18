module.exports = (str) ->
  if str
    str.replace /(^\w)|(\s\w)/g, (letter) ->
      letter.toUpperCase()
