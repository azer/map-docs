var book   = require('./book'),
    author = require('./author');

var jacklondon     = { 'first_name': 'Jack', 'last_name': 'london' },
    jackkerouac    = { 'first_name': 'Jack', 'last_name': 'kerouac' },
    allengingsberg = { 'first_name': 'Allen', 'last_name': 'ginsberg' },

    whitefang = { 'title': 'White Fang', 'author': jacklondon },
    ontheroad = { 'title': 'On The Road', 'author': jackkerouac },
    howl      = { 'title': 'Howl', 'price':8, 'author': allengingsberg },

    books     = [ whitefang, ontheroad, howl ];

module.exports = {
  'book': book,
  'author': author,

  'jacklondon': jacklondon,
  'jackkerouac': jackkerouac,
  'allengingsberg': allengingsberg,

  'whitefang': whitefang,
  'ontheroad': ontheroad,
  'howl': howl,

  'books': books
};
