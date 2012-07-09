var assert = require('assert'),
    map    = require('../lib'),
    arraydb = require('./array-db'),
    types  = arraydb.types,

    book  = require('./book'),

    whitefang = { 'title': 'White Fang', 'author': 'Jack London' },
    ontheroad = { 'title': 'On The Road', 'author': 'Jack Kerouac' },
    howl      = { 'title': 'Howl', 'author': 'Allen Ginsberg', 'price':8 },

    books     = [ whitefang, ontheroad, howl ],

    fruits    = [
      { 'name': 'apple', 'price': 3 },
      { 'name': 'banana', 'price': 1 },
      { 'name': 'orange', 'price': 4 }
    ];

function testRemove(callback){
  book.insert(whitefang, function(_, doc){

    doc.remove(function(_){

      book.one(doc.id(), function(_, copy){

        assert.ok( !copy );
        callback();

      });

    });

  });
}


function testSave(callback){

  doc.price('10.00$');
  doc.tax(50);

  doc.save(function(error, copy){

    if(error){
      callback(error);
      return;
    }

    assert.equal( copy.price(), 15 );
    callback();

  });
}

function testUpdate(callback){
  copy.update({ 'title': 'quux' }, function(error, result){

    book.one(doc.id(), function(_, copy){

      assert.equal( copy.title(), 'quux');
      assert.equal( copy.author(), 'bar');
      assert.equal( copy.price(), 3.3);
      assert.equal( copy.tax(), 10);

      callback();

    });

  });
}

function testSync(callback){
  var wf = book.create(whitefang);

  wf.sync({
    'title': 'white fang 2',
    'author': 'jack london 2'
  });

  assert.equal( wf.title(), 'white fang 2');
  assert.equal( wf.author(), 'jack london 2');

  wf.sync(function(error){

    if(error){
      callback(error);
      return;
    }

    book.one(wf.id(), function(error, copy){

      if(error){
        callback(error);
        return;
      }


    });

  });

}

function testToJSON(callback){
  var wf = book.create(whitefang);

  wf.tax(50);
  wf.price('8$');

  var content = wf.toJSON(),
      fields  = Object.keys(content);

  assert.equal(fields.length, 7 );
  assert.equal(content.title, 'White Fang');
  assert.equal(content.author, 'Jack London');
  assert.equal(content.price, 8);
  assert.equal(content.tax, 50);

  callback();

}

module.exports = {
  'testSync': testSync,
  'testToJSON': testToJSON
};
