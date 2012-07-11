var assert    = require('assert'),

    arraydb   = require('./array-db'),
    types     = arraydb.types,

    map       = require('../lib'),

    content   = require('./content'),
    book      = content.book,
    books     = content.books,
    fruits    = content.fruits,
    whitefang = content.whitefang;

function testDefinition(callback){

  assert.equal( book.collection, 'books');
  assert.equal( book.fields.title, types.string );
  assert.equal( book.fields.author, types.string );
  assert.ok( book.fields.price );
  assert.ok( book.fields.tax );
  assert.ok( book.fields.createTS );
  assert.ok( book.fields.lastUpdateTS );

  assert.equal( typeof book.find, 'function' );
  assert.equal( typeof book.insert, 'function' );
  assert.equal( typeof book.one, 'function' );
  assert.equal( typeof book.update, 'function' );
  assert.equal( typeof book.remove, 'function' );
  assert.equal( typeof book.save, 'function' );
  assert.equal( typeof book.validate, 'function' );

  callback();

}

function testCreate(callback){

  var foo = book.create({
    'title': 'foo',
    'invalid': 123
  });

  assert.equal( foo.title(), 'foo');
  assert.equal( foo.author(), undefined);

  foo.author('bar');

  assert.equal( foo.author(), 'bar');

  assert.ok( !foo.invalid );

  callback();

}

function testFind(callback){

  book.insert(books, function(error, docs){

    if(error){
      callback(error);
      return;
    }

    book.find(docs[0].id(), function(error, results){

      if(error){
        callback(error);
        return;
      }

      assert.equal(results.length, 1);
      assert.equal(String(docs[0].id()), String(results[0].id()));
      callback();

    });

  });

}

function testOne(callback){

  book.insert(whitefang, function(error, entry){

    if(error){
      callback(error);
      return;
    };

    book.one(entry.id(), function(error, copy){

      if(error){
        callback(error);
        return;
      }

      assert.equal(copy.id(), entry.id());
      assert.equal(copy.title(), entry.title());
      assert.equal(copy.author(), entry.author());
      assert.equal(copy.price(), entry.price());
      assert.equal(copy.tax(), entry.tax());
      assert.equal(copy.createTS(), entry.createTS());
      assert.ok(copy.lastUpdateTS(), entry.lastUpdateTS());

      callback();

    });

  });

}

function testInsert(callback){

  book.insert(whitefang, function(error, doc){

    if(error){
      callback(error);
      return;
    }

    assert.equal( doc.title(), 'White Fang' );
    assert.equal( doc.author(), 'Jack London' );
    assert.equal( doc.price(), 6);
    assert.equal( doc.tax(), 20);
    assert.ok( doc.createTS() > +(new Date) - 250);
    assert.ok( doc.lastUpdateTS() > +(new Date) - 250);

    book.insert(books, function(error, docs){

      if(error){
        callback(error);
        return;
      }

      assert.equal( docs[0].title(), 'White Fang' );
      assert.equal( docs[1].author(), 'Jack Kerouac' );
      assert.equal( docs[2].price(), 9.6);
      assert.equal( docs[0].tax(), 20);
      assert.ok( docs[0].createTS() > +(new Date) - 250);
      assert.ok( docs[1].lastUpdateTS() > +(new Date) - 250);
      assert.ok( docs[0].id() );

      book.insert({ 'title': 'foo' }, function(error){

        assert.ok(error);
        callback();

      });

    });

  });

}


function testUpdate(callback){
  book.insert(whitefang, function(error, doc){

    if(error){
      callback(error);
      return;
    }

    doc.title('foo');
    doc.author('bar');
    doc.price('3$');
    doc.tax(10);

    book.update(doc.id(), doc, function(error){

      if(error){
        callback(error);
        return;
      }

      book.one(doc.id(), function(error, copy){

        if(error){
          callback(error);
          return;
        }

        assert.equal( copy.id(), doc.id());
        assert.equal( copy.title(), 'foo');
        assert.equal( copy.author(), 'bar');
        assert.equal( copy.price(), 3.3);
        assert.equal( copy.tax(), 10);

        callback();

      });

    });

  });

}

function testRemove(callback){
  book.insert(whitefang, function(error, doc){

    if(error) {
      callback(error);
      return;
    }

    book.remove(doc.id(), function(error){

      if(error) {
        callback(error);
        return;
      }

      book.one(doc.id(), function(error, copy){

        if(error) {
          callback(error);
          return;
        }

        assert.ok( !copy );

        callback();

      });

    });

  });
}

function testSave(callback){

  book.save(whitefang, function(error, doc){

    if(error){
      callback(error);
      return;
    }

    assert.equal( doc.title(), 'White Fang' );
    assert.equal( doc.author(), 'Jack London' );
    assert.equal( doc.price(), 6 );
    assert.ok( doc.createTS() );
    assert.ok( doc.lastUpdateTS() );

    doc.title('foo');
    doc.author('bar');

    book.save(doc, function(error, copy){

      if(error){
        callback(error);
        return;
      }

      assert.equal( copy.id(), doc.id() );
      assert.equal( copy.title(), 'foo' );
      assert.equal( copy.author(), 'bar' );
      assert.equal( doc.price(), 6 );
      assert.ok( copy.createTS() );
      assert.ok( copy.lastUpdateTS() );

      callback();

    });

  });
}

function testValidateData(callback){

  book.validate({
    'title': 'white fang',
    'author': 'jack london',
    'createTS': +(new Date)
  });

  var prodError;

  try {
    book.validate({
      'title': 1,
      'author': 'asdj akfj'
    });

  } catch(error) {
    prodError = true;
  }

  assert.ok(prodError);

  callback();

}

function testIsDocument(callback){
  var wf = book.create(whitefang);

  assert.equal( map.isDocument(whitefang), false );
  assert.equal( map.isDocument(wf), true );

  callback();
}

module.exports = {
  'testCreate': testCreate,
  'testDefinition': testDefinition,
  'testFind': testFind,
  'testOne': testOne,
  'testUpdate': testUpdate,
  'testRemove': testRemove,
  'testSave': testSave,
  'testValidateData': testValidateData,
  'testInsert': testInsert,
  'testIsDocument': testIsDocument
};
