MapJS is a library for creating data-binding libraries that can interact with eachother. It's written in JavaScript and targets both 
NodeJS and web browsers.

# MOTIVATION

  * **Functional:**
  * **Flexibility:**
  * **Simplicity:**
  * **Cross-platform:**


![](https://dl.dropbox.com/s/ja4busjvo3kvwhr/53339576807016984_goM4BxQr_f.jpg)

# SYNOPSIS

```js
var tweet = mapRSS('https://api.twitter.com/1/statuses/user_timeline.rss?screen_name={{ user.name }}', {
  text: String
});

var user = mapMongoDB('users', {
  name: { type: String, required: true, min: 3, max: 18 },
  email: mapMongo.types.email,
  age: Number,
  tweets: [tweet('user')],
  lastModified: { type: Date, auto: true }
  greeting: function(doc){
    return 'Hello ' + doc.name() + '!';
  }
});

user.greeting = 

user.find({ age: { '$gte': 18 } }, function(error, result){
  
  assert( !error );
  
  var joe = results[0]
  
  assert( joe.id() ); // returns the value of _id field from mongodb
  assert( joe.tweets() ); // should be an empty array. "find" doesn't load subdocs.
  
});
```

# LIBRARIES BASED ON MAPJS

* [map-mongo](http://github.com/azer/map-mongo)
* [map-boxcars](http://github.com/azer/map-boxcars)

# INSTALL

```bash
$ npm install map
```

# USAGE

## Drivers

## Schemas

## Documents

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
