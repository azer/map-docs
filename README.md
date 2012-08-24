MapJS is a library for creating data-binding libraries that can interact with eachother.

**Target Platforms:** NodeJS, B2G and Web Browsers

**Status:** In Development

# MOTIVATION

![](https://dl.dropbox.com/s/62jdjz3vtlooov2/--560240.jpeg)

# INSTALL

```bash
$ npm install map
```

# PROJECTS BASED ON MAPJS

* [map-mongo](http://github.com/azer/map-mongo)

# USAGE

### Creating Drivers

```js

// basic-db.js

var map = require('map');

function get(query, callback){ /* impl */ }

function find(query, callback){ /* impl */ }

function save(content, callback){ /* impl */ }

module.exports = map({
    'get': get,
    'find': find,
    'save': save
});
```

### Schemas

*JavaScript:*

```js
// document.js

var basicdb = require('./basic-db');

module.exports = basicdb({
    'title': { type: String, 'min': 2, 'max': 255  },
    'content': String
    'lastModifiedTS': Date
});
```

*CoffeeScript*

```coffee
// document.coffee

basicdb = require './basic-db'

module.exports = basicdb {
  title: String
  content: String
  lastModifiedTS: Date
}
```

### Documents

```js

var document = require('./document');

var foo = document({
    'title': 'Hello World',
    'content': 'This tiny document needs some friends!'
});

foo.id(); // undefined
foo.title(); // "Hello World"
foo.content(); // "This tiny...

document.save(foo, function(error){

    if(error) throw error;

    foo.id(); // "/docs/hello_world.txt"

});

```

### Passing Options Between Drivers and Schemas

Driver:

```js
// mongodb.js

var map = require('map');

function find(coll, query, callback){ /* impl */ }

function save(coll, content, callback){ /* impl */ }

module.exports = map({
    'idFieldName': '_id',
    'find': find,
    'save': save
});
```

Schema:

*JavaScript*

```js
// user.js

var mongodb  = require('./mongodb'),
    document = require('./document');

var user = mongodb('users',{ // Parameters can be passed before model structures
    'nickname': { type: String, 'min': 2, 'max': 16 },
    'email': mongodb.types.email,
    'docs': mongodb.types.oneToMany(document)
});
```

*CoffeeScript:*

```coffee

// user.coffee

mongodb = require './mongodb'
document = require './document'

user = mongodb 'users', {
  nickname: String
  email: mongodb.types.email
  docs: mongodb.types.oneToMany document
}

```

# Usage Demonstration

```js
var user     = require('user'),
    document = require('document');

var joe = user({
    'nickname': 'Fast Joe',
    'email': 'fastjoe@mail.com'
});

joe.nickname(); // "Fast Joe"
joe.email(); // "fastjoe@mail.com"
joe.docs(); // []

document('/docs/hello_world.txt', function(error, helloWorld){ // or document.get

    if(error) throw error;

    joe.docs.push(helloWorld);

    user.save(joe, function(error){

        if(error) throw error;

        user(joe.id(), function(error, joe){

            if(error) throw error;

            joe.docs(); // [helloWorld]
        });

    });
});

```

## Pub/Sub

### Subscription

CoffeeScript:

```coffee
people.subscribe joe, (updatedFields) ->
    console.log updatedFields

joe.name 'very fast joe'
joe.age 19

process.nextTick->
    joe.name 'very, very fast joe'
```

The code above will output:
```
['name', 'age']
['name']
```

### Publish

CoffeeScript

```coffee
people.publish joe, {
  name: 'super fast joe.'
  age: 20
}
```

Will output:

```
['name', 'age']
```
