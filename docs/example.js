var schema = require('schema'),
    assert = require('assert');

const DEFAULT_BOOK_PRICE = 5;

var book = schema('books', {
  'title': schema.types.string,
  'author': schema.types.string,
  'price': price
});

function price(schema, field, value){
  if(value == undefined){
    return DEFAULT_BOOK_PRICE;
  }

  if(typeof value != 'number'){
    throw schema.errors.invalidInputError(schema, field, value);
  }

  return value;
}

/*
 * SAVE & UPDATE
 */

book.insert({ 'name':'on the road', 'author': 'jack keruac' }, function(error, ontheroad){

  ontheroad.update({ 'price':'6' }, function(error){
    //
  });

});

book.update({ 'name':'on the road' }, { 'price': 6 }, function(error){
  //
});

var whitefang = book({
  'title': 'White Fang',
  'author': 'Jack London'
});

whitefang.save(function(error){

  whitefang.price(6);

  whitefang.save(function(error){
    //
  });

});

/*
 * QUERYING
 */

book(whitefang.id, function(error, whitefang){
  assert.equal(whitefang.title(), 'white fang');
});

book('nonexisting', function(error, nonexisting){

  assert.equal(nonexisting, null);

});

book({ 'price':{ 'gte':5 } }, function(error, results){

  assert.equal(results.length, 2);

});

/*
 * SYNC
 */

whitefang.sync({ 'price': 10 }); // this will update the object only

whitefang.sync({ 'price': 8 }, function(error){ // this will call the update method of driver
  //
});
