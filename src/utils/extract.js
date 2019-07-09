'use strict';

function compose(f) {
  return function(g) {
    return function(a) {
      return g(f(a));
    }
  }
}

module.exports = compose;

module.exports.default = compose;
