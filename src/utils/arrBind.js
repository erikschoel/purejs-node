'use strict';

module.exports = module.exports.default = (function(recurse, bind, wrap, values) {
  return function arrBind(f) {
    return wrap(recurse(bind(recurse(bind(f), values)), values));
  }
})(
  function recurse(bind, values) {
    return function(result, index) {
      return result instanceof Array ? bind(result, index) : (typeof result === 'object' ? bind(values(result), index) : bind([ result ], index));
    }
  },
  function bind(f) {
    return function(x, i) {
      return Array.prototype.concat.apply([], x instanceof Array ? x.map(f) : f(x, i));
    }
  },
  function wrap(bind) {
    return function(value, index) {
      return bind(value, index || 0);
    }
  }
);
