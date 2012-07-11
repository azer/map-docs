var book = require('./book');

var whitefang = { 'title': 'White Fang', 'author': 'Jack London' },
    ontheroad = { 'title': 'On The Road', 'author': 'Jack Kerouac' },
    howl      = { 'title': 'Howl', 'author': 'Allen Ginsberg', 'price':8 },

    books     = [ whitefang, ontheroad, howl ],

    fruits    = [
      { 'name': 'apple', 'price': 3 },
      { 'name': 'banana', 'price': 1 },
      { 'name': 'orange', 'price': 4 }
    ];

module.exports = {
  'book': book,

  'whitefang': whitefang,
  'ontheroad': ontheroad,
  'howl': howl,

  'books': books,
  'fruits': fruits
};
