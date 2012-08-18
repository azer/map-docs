/**
 * Return the name of ID field for the driver of specified schema.
 *
 * @param {Driver, Schema} schema
 * @return {String}
 */
function idFieldName(o){
  return ( o.driver ? o.driver.impl.idFieldName || o.driver.impl.id : o.impl.idFieldName || o.impl.id ) || 'id';
}

module.exports = idFieldName;
