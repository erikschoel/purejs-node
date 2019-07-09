'use strict';

function left(x) {
  return function (l) {
    return function (r) {
      return l(x);
    };
  };
}

module.exports = left;

module.exports.default = left;