module.exports = function(val, ctx) {
  if (typeof val === 'function') {
    var args = Array.prototype.slice.call(arguments, 1);
    return val.apply(null, args);
  }
  return val;
};
