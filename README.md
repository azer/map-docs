MapJS is a library for creating data-binding libraries that can interact with eachother.

# Install

```bash
$ npm install map
```

Status: In Development  

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

## Creating Documents

```js

var joe = user({
  'nickname': 'fast joe',
  'email': 'fastjoe@gmail.com'
});

joe.messages.push( message({ text: 'Hi!' }), 
  message({ text: 'This is Joe.' }), 
  message({ text: 'I\'m from TX.' }) );

```

## Saving, Finding and Synchronization


### Saving

```js

joe.save();

```