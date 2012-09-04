MapJS is a library for creating data-binding libraries that can interact with eachother. It's written in JavaScript and targets both 
NodeJS and web browsers.

# MOTIVATION

  * **Functional:**
  * **Flexibility:**
  * **Simplicity:**
  * **Compatibility:**
  * **Multi-platform:**


![](https://dl.dropbox.com/s/ja4busjvo3kvwhr/53339576807016984_goM4BxQr_f.jpg)

# SYNOPSIS

```js
var tweet = mapRSS('https://api.twitter.com/1/statuses/user_timeline.rss?screen_name={{ user }}', {
  user: mapRSS.types.document,
  text: String,
  date: Date
});

var profile = mapMongoDB('profiles', {
  name: String, // or: { type: mapMongo.types.string, required: Boolean, min: Number, max: Number },
  birthdate: Date, // or: { type: mapMongo.types.date, auto: false }
  twitter: String, 
  tweets: [tweet('user')], // or: { type: mapMongo.types.document, schema: tweet, method: 'find', targetField: 'user' }
  
  greeting: function(doc){ // or { property: function(){..} }
    return 'Hello ' + doc.name() + '!';
  }
});

var user = mapMongoDB('users', {
  email: mapMongo.types.email, // or: { type: mapMongo.types.email }
  password: String,
  profile: profile // or { type: mapMongo.types.document, schema: profile, method: get }
});

var userView = mapMustache('<h1>{{ profile.greeting }}</h1> Tweets: {{# profile.tweets }} {{> .}} {{/profile.tweets}}');

var userController = mapModelView({
  model: user,
  view: userView
});

/**
 * Creating, saving and finding documents
 */
var joe = user({
  email: 'joe@mail.com',
  password: 'j03',
  profile: {
    name: 'Joe',
    birthdate: new Date('01.01.1987'),
    twitter: 'joe'
  }
});

user.save(joe, function(error){
 
  if(error) throw error;
  
  assert(joe.id());
  assert(joe.profile.id());
  assert(joe.profile.tweets.length, 20);
  assert(joe.profile.tweets[0].text(), 'RT @foo bar');
  
  user.find(function(error, results){ // a query can be passed here:  user.find(1 .. or user.find({ 'key': value }
    
    if(error) throw error;
    
    assert(results.length == 1);
    assert(results[0].profile() == joe.profile.id()); // find methods don't retrieve subdocs.
  
  });

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
