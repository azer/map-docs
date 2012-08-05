MapJS is a library for creating data-binding libraries that can interact with eachother.

**Target Platforms:** NodeJS, B2G and Web Browsers

**Status:** In Development

# Install

```bash
$ npm install map
```

# Usage Example

## Defining Schemas

```js

var mongo    = require('map-mongo'),
    postgres = require('map-postgres');

var user = postgres.schema('users', {
  'nickname': postgres.types.string,
  'email': postgres.types.email
});

var message = mongo.schema('messages', {
  'author': user,
  'text': mongo.types.string
});

```

## Creating and Saving Docs

```js

var joe = user({ // or user.create
  'nickname': 'fast joe',
  'email': 'fastjoe@gmail.com'
});

joe.messages.push( message({ text: 'Hi!' }), message({ text: 'This is Joe.' }), message({ text: 'I\'m from TX.' }) );

user.save(joe, function(error){

    console.log( joe.id() ); // 1
    console.log( joe.messages[0].id() ); // 47cc67093475061e3d95369d
    console.log( joe.messages[0].user.nickname() ); // fast joe

});

```

## Getting & Finding Docs

```js
user(1, function(error, joe){ // or user.get

    if(error){
        callback(error);
        return;
    }

    joe.nickname(); // fast joe
    joe.messages.length; // 3

});
```

### Finding

```js
user.find({ 'price': { '$gte': 5 }  }, ['id'], function(error, results){

    if(error){
        callback(error);
        return;
    }

    var joe = results[0];
    joe.nickname(); // fast joe
    joe.messages.length; // 3

});
```

### Lazy Loading Nested Docs

```js

user.all('id', function( error, results ){ // or user.find({ 'price':{ '$gte':5 } }, ['id'], function(...

    if(error) throw error;

    results.length; // 2137843
    results[0]; // 1
    results[1]; // 2
    results[2]; // 3

    user.map(user.get, results.slice(0, 3), function(error, users){

      if(error) throw error;

      var joe = results[0];

      joe.nickname(); // fast joe
      joe.messages.length; // 3

    });

});

```

## Synchronization

```js

user.subscribe(joe, function( updates ){

    console.log( updates ); // { nickname: 'very fast joe', messages:[...] }

});

joe.nickname('very fast joe');

user.sync(joe, function( error, updates ){

    if(error) throw error;

    console.log( updates ); // { nickname: 'very fast joe', messages:[...] }

});

```

## Creating Libraries

### Main Interface

* coll
* find (optional)
* get
* idFieldName (optional)
* remove (optional)
* save (optional)
* set (optional)
* toString

### Example

```js
var colls = {};

function coll(name){
    !colls[name] && ( colls[name] = [] );
    return colls[name];
}

function get(collName, id, callback){
    callback(undefined, coll(collName)[id]);
}

// extensions are allowed
function insert(collName, objects, callback){
    objects.forEach(function(el){
      el.id = coll(collName).push(el) - 1;
    });
}

function save(){
    if(doc.id == undefined){
        doc.id = coll(collName).push(doc) - 1;
    } else {
        coll(collName)[doc.id] = doc;
    }

    callback(undefined, doc.id);
}

function toString(){
    return 'hashdb';
}

module.exports = map.newDriver({
    coll: coll,
    get: get,
    insert: insert,
    save: save,
    toString: toString
});
```
