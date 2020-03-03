'use strict';

function property(fn) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return function(obj) {
      return !obj || !fn ? null :
      (fn instanceof Function ? fn.apply(obj, args) :
      (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : obj[fn]));
    }
  }
}

module.exports = property;

module.exports.default = property;
