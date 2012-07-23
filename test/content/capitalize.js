module.exports = function(_, _, _, str){

  return str ? str.replace(/(^\w)|(\s\w)/g, function(letter){
    return letter.toUpperCase();
  }) : undefined;

};
