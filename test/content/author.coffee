mapdb      = require '../map-db'
capitalize = require './capitalize'

author = mapdb 'authors', {
    first_name: { type: String, set: capitalize }
    last_name: { type: String, set: capitalize }
  }

module.exports = author
