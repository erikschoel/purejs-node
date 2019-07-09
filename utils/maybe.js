'use strict';

function maybe(m) {
  return function (l) {
    return function (r) {
      return m(l)(r);
    };
  };
}

module.exports = maybe;

module.exports.default = maybe;