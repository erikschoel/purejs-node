'use strict';

function tap(f) {
  return function(x) {
    return unit(x, f(x));
  }
}

module.exports = tap;

module.exports.default = tap;
