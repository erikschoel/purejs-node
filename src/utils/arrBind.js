'use strict';

var values = require('./values');

function recurse(bind) {
  return function(result, index) {
    return result instanceof Array ? bind(result, index) : (typeof result === 'object' ? bind(values(result), index) : bind([ result ], index));
  }
}

function bind(f) {
  return function(x, i) {
    return Array.prototype.concat.apply([], x instanceof Array ? x.map(f) : f(x, i));
  }
}

function wrap(bind) {
  return function(value, index) {
    return recurse(bind)(value, index || 0);
  }
}

function arrBind(f) {
  return wrap(bind(recurse(bind(f))));
}
module.exports = arrBind;

module.exports.default = arrBind;
