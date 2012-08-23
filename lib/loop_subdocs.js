/**
 * Iterate subdocuments of given doc asynchronously.
 *
 * @param {Document} document
 * @param {Function} each
 * @param {Function} end
 */
function loopSubDocs(document, each, end){
  var fields = Object.keys(document.id.schema.fields), obj;

  (function iter(i, error){

    if(error){
      end(error);
      return;
    }

    if( i >= fields.length ){
      end();
      return;
    }

    if( !isDocument(document[fields[i]]) ){
      iter(i+1);
      return;
    }

    each(fields[i], document[fields[i]], iter.bind(undefined, i+1));

  }(0));
}

// FIXME
function isDocument(obj){
  return !!( obj && obj.id && obj.id.isDocument );
}

module.exports = loopSubDocs;
