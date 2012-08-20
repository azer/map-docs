var logging    = require('./logging')('pubsub'),
    nextTick   = require('./next_tick');

module.exports = {
  'subscribe'   : subscribe,
  'unsubscribe' : unsubscribe,
  'publish'     : publish
};

function guard(document){
  document.id.pubsub || ( document.id.pubsub = {} );
  document.id.pubsub.subscribers || ( document.id.pubsub.subscribers = [] );
  document.id.pubsub.fieldsToEmit || ( document.id.pubsub.fieldsToEmit = [] );
}

/**
 * Emit given field names to subscribers
 *
 * @param {Document} document
 * @param {Object} updatedFields
 */
function emit(document, updatedFields){
  logging.info('Adding %s to the publish queue of %s.', updatedFields, document);

  document.id.pubsub.fieldsToEmit.push.apply(document.id.pubsub.fieldsToEmit, updatedFields);

  nextTick(function(){
    var fields = document.id.pubsub.fieldsToEmit.splice(0)
          .filter(function(el, ind, l){
            return l.indexOf(el, ind+1) == -1;
          });

    if(fields.length == 0) return;

    logging.info('Publishing %s to the subscribers of %s', fields, document);

    document.id.pubsub.subscribers.forEach(function(cb){
      if( typeof cb != 'function' ) return;

      nextTick(function(){
        cb.call(undefined, fields);
      });
    });

  });
}

/**
 * Subscribe to all updates of given document
 *
 * @param {Document} document
 * @param {Function} callback
 */
function subscribe(document, callback){
  guard(document);
  document.id.pubsub.subscribers.push(callback);
}

/**
 * Unsubscribe to all updates of given document
 *
 * @param {Document} document
 * @param {Function} callback
 */
function unsubscribe(document, callback){
  guard(document);

  var callbacks = document.id.pubsub.subscribers;
  callbacks[ callbacks.indexOf(callback) ] = undefined;
}

/**
 * Publish new updates in following format; { 'property': value, ... }
 *
 * @param {Document} document
 * @param {Object} content
 */
function publish(document, content){
  logging.info('Publishing %s into %s', content, document);

  guard(document);

  var key;
  for(key in content){
    document[key]( content[key] );
  }

  emit( document, Object.keys(content) );
}

publish.withoutUpdate = function(document, fieldName){
  logging.info('Publishing single field: %s into %s', fieldName, document);

  guard(document);

  emit( document, [fieldName] );
};


