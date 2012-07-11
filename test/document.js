var assert    = require('assert'),

    arraydb   = require('./array-db'),
    types     = arraydb.types,

    map       = require('../lib'),

    content   = require('./content'),
    book      = content.book,
    books     = content.books,
    fruits    = content.fruits,
    whitefang = content.whitefang;

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
  book.insert(whitefang, function(error, doc){

    if(error){
      callback(error);
      return;
    }

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

  });
}

function testUpdate(callback){

  book.insert(whitefang, function(error, doc){

    if(error){
      callback(error);
      return;
    }

    doc.update({ 'title': 'quux', 'author':'bar' }, function(error, result){

      if(error){
        callback(error);
        return;
      }

      book.one(doc.id(), function(_, copy){

        assert.equal( copy.title(), 'quux');
        assert.equal( copy.author(), 'bar');
        assert.equal( copy.price(), 6);
        assert.equal( copy.tax(), 20);

        callback();

      });

    });

  });
}

function testSync(callback){

  var ts;

  book.insert(whitefang, function(_, wf){

    assert.ok(wf.sync.ts() > +(new Date)-100);

    ts = wf.sync.ts();

    setTimeout(function(){

      wf.sync({
        'title': 'foo',
        'author': 'bar'
      });

      assert.ok( wf.sync.ts() > ts);

      assert.ok( wf.id() );
      assert.equal( wf.title(), 'foo');
      assert.equal( wf.author(), 'bar');

      book.one(wf.id(), function(error, copy){

        if(error){
          callback(error);
          return;
        }

        assert.equal(copy.id(), wf.id());
        assert.equal(copy.title(), 'White Fang');
        assert.equal(copy.author(), 'Jack London');

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

            assert.equal(copy.id(), wf.id());
            assert.equal(copy.title(), 'foo');
            assert.equal(copy.author(), 'bar');

            callback();

          });

        });

      });

    }, 50);

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
  'testRemove': testRemove,
  'testSave': testSave,
  'testUpdate': testUpdate,
  'testSync': testSync,
  'testToJSON': testToJSON
};
