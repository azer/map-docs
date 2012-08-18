/**
 * Ensure given string is formatted as lowerCamelCase
 *
 * @param {String} name
 * @return {String}
 */
function lowerCamelCase(str){
  return str
    .replace(/[^a-zA-Z0-9]+/g,' ')
    .replace(/^[\d\s]+/g,'').split(' ')
    .reduce(function(a,b){
      return a + b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
    });
}

module.exports = lowerCamelCase;
