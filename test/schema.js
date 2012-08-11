var assert    = require('assert'),

    arraydb   = require('./array-db'),
    types     = arraydb.types,

    map       = require('../lib'),

    content   = require('./content'),
    book      = content.book,
    author    = content.author,
    books     = content.books,
    whitefang = content.whitefang;

function testDefinition(callback){

  assert.equal( book.collection, 'books');
  assert.equal( book.fields.title, types.string );
  assert.equal( book.fields.author.type, types.subschema  );
  assert.ok( book.fields.price );
  assert.ok( book.fields.tax );
  assert.ok( book.fields.createTS );
  assert.ok( book.fields.lastUpdateTS );

  assert.equal( typeof book.create, 'function' );
  assert.equal( typeof book.find, 'function' );
  assert.equal( typeof book.insert, 'function' );
  assert.equal( typeof book.get, 'function' );
  assert.equal( typeof book.remove, 'function' );
  assert.equal( typeof book.save, 'function' );
  assert.equal( typeof book.set, 'function' );
  assert.equal( typeof book.validate, 'function' );

  callback();

}

function testCreate(callback){

  var bar = book.create({ 'title': 'bar', 'price':'$8', 'tax':50, 'author':'an invalid pk' });

  assert.equal( bar.title(), 'Bar');
  assert.equal( bar.price(), '$12');
  assert.equal( bar.author(), 'an invalid pk' );

  var foo = book.create({ 'title': 'foo', 'price':'$5', 'author':{ 'first_name': 'corge', 'last_name': 'qux' } });

  assert.equal( foo.title(), 'Foo');
  assert.equal( foo.price(), '$6');
  assert.equal( foo.author.firstName(), 'Corge');
  assert.equal( foo.author.lastName(), 'Qux');

  foo.title('f00');
  assert.equal( foo.title(), 'F00');

  foo.author.firstName('c0rg3');
  assert.equal( foo.author.firstName(), 'C0rg3');

  var qux = book({
    'title': 'Finike Cetesi',
    'author': author({
      'first_name': 'Azer',
      'last_name': 'Koculu'
    })
  });

  assert.equal( qux.title(), 'Finike Cetesi');
  assert.equal( qux.author.firstName(), 'Azer' );
  assert.equal( qux.author.lastName(), 'Koculu' );

  callback();
}

function testIsDocument(callback){
  var wf = book.create(whitefang);

  assert.equal( map.isDocument(whitefang), false );
  assert.equal( map.isDocument(wf), true );

  callback();
}

function testFind(callback){

  book.save(book(whitefang), function(error, id){

    if(error){
      callback(error);
      return;
    }

    book.find({ price:5 }, function(error, results){

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

function testGet(callback){

  var entry = book(whitefang);

  book.save(entry, function(error, id){

    if(error){
      callback(error);
      return;
    };

    book.get(id, function(error, copy){

      if(error){
        callback(error);
        return;
      }

      assert.ok(copy.id() != undefined);
      assert.equal(copy.title(), entry.title());
      assert.equal(copy.author.firstName(), entry.author.firstName());
      assert.equal(copy.author.lastName(), entry.author.lastName());
      assert.equal(copy.price(), entry.price());
      assert.equal(copy.tax(), entry.tax());
      assert.equal(copy.createTS(), entry.createTS());
      assert.ok(copy.lastUpdateTS(), entry.lastUpdateTS());

      copy.foo = 1;
      copy.author = 1;

      book.get(id, function(error, copy){

        if(error){
          callback(error);
          return;
        }

        assert.ok(!copy.foo);
        assert.notEqual(copy.foo, 1);

        callback();

      });

    });

  });

}

function testRemove(callback){
  book.save(book(whitefang), function(error, id){

    if(error) {
      callback(error);
      return;
    }

    book.get(id, function(error, doc){

      if(error){
        callback(error);
        return;
      }

      book.remove(id, function(error){

        if(error) {
          callback(error);
          return;
        }

        book.get(id, function(error, copy){

          if(error) {
            callback(error);
            return;
          }

          assert.ok( !copy );

          author.get(doc.author.id(), function(error, copy){

            if(error) {
              callback(error);
              return;
            }

            assert.ok( !copy );

            callback();

          });

        });

      });

    });

  });
}

function testSave(callback){

  book.save(book(whitefang), function(error, id){

    if(error){
      callback(error);
      return;
    }

    book.get(id, function(error, doc){

      if(error){
        callback(error);
        return;
      }

      assert.equal( doc.title(), 'White Fang' );

      assert.equal( doc.author.firstName(), 'Jack');
      assert.equal( doc.price(), '$6' );
      assert.ok( doc.createTS() );
      assert.ok( doc.lastUpdateTS() );

      doc.title('foo');
      doc.author.firstName('bar');

      book.save(doc, function(error, idcopy){

        if(error){
          callback(error);
          return;
        }

        assert.equal(id, idcopy);

        book(id, function(error, copy){

          if(error){
            callback(error);
            return;
          }

          assert.equal( copy.id(), doc.id() );
          assert.equal( copy.title(), 'Foo' );
          assert.equal( copy.author.firstName(), 'Bar' );
          assert.equal( doc.price(), '$6' );
          assert.ok( copy.createTS() );
          assert.ok( copy.lastUpdateTS() );

          callback();

        });

      });

    });

  });
}

function testValidateDocument(callback){
  var ts = +(new Date),

      doc = book({
        'title': 'white fang',
        'author': {
          'first_name': 'jack',
          'last_name': 'london'
        },
        'createTS': ts
      });

  book.validate(doc);

  assert.equal( doc.title(), 'White Fang');
  assert.equal( doc.author.firstName(), 'Jack');
  assert.equal( doc.author.lastName(), 'London');

  assert.equal( doc.price(), '$6');
  assert.equal( doc.createTS(), ts );

  doc = book({
    'title': 'white fang',
    'author': '1',
    'createTS': +(new Date)
  });

  book.validate(doc);

  assert.equal( doc.title(), 'White Fang');
  assert.equal( doc.author(), '1');

  doc = book({
    'title': 'Finike Cetesi',
    'author': author({
      'first_name': 'Azer',
      'last_name': 'Koculu'
    })
  });

  book.validate(doc);

  assert.equal( doc.author.firstName(), 'Azer');
  assert.equal( doc.author.lastName(), 'Koculu');

  throwsError(function(){

    doc = book({
      'title': 'white fang'
    });

    book.validate(doc);

  });

  throwsError(function(){

    doc = book({
      'title': 'Finike Cetesi',
      'author': author({
        'first_name': 'Azer'
          })
    });

    book.validate(doc);

  });

  throwsError(function(){

    doc = book({
      'title': 1,
      'author': 'id'
    });

    book.validate(doc);

  });

  throwsError(function(){

    doc = book({
      'title': 'foo',
      'author': undefined
    });

    book.validate(doc);

  });

  throwsError(function(){

    doc = book({
      'title': 'foo',
      'author': {
        'last_name': 'london'
      }
    });

    book.validate(doc);

  });

  callback();
}

function throwsError(fn){
  var prodError;

  try {
    fn();
  } catch(error) {
    prodError = true;
  }

  assert.ok(prodError);
}

module.exports = {
  'testCreate': testCreate,
  'testDefinition': testDefinition,
  'testFind': testFind,
  'testGet': testGet,
  'testRemove': testRemove,
  'testSave': testSave,
  'testValidateDocument': testValidateDocument,
  'testIsDocument': testIsDocument
};
