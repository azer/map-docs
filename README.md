MapJS is a library for creating data-binding libraries that can interact with eachother.

Status: In Development 

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

joe.save();

console.log( joe.id() ); // 1
console.log( joe.messages[0].id() ); // 47cc67093475061e3d95369d
console.log( joe.messages[0].user.nickname() ); // fast joe

```

## Finding Docs

```js

user(1, function( error, results ){ // or user.find

    if(error) throw error;

    var joe = results[0];

   joe.nickname(); // fast joe
   joe.messages.length; // 3

});

```

## Synchronization

```js

joe.subscribe(function( updates ){

   console.log( updates ); // { nickname: 'very fast joe', messages:[...] } 

});

joe.nickname('very fast joe');

joe.sync(function( error, updates ){

    if(error) throw error;

    console.log( updates ); // { nickname: 'very fast joe', messages:[...] } 

});

```
