module.exports = typeof process != 'undefined' && process.nextTick || function(fn){
  setTimeout(function(){ fn(); }, 0);
};
