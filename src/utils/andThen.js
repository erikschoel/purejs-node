'use strict';

function andThen(g) {
  return function(f) {
    return function(a) {
      return g(f(a));
    }
  };
}

module.exports = andThen;

module.exports.default = andThen;
