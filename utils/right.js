'use strict';

function right(x) {
  return function (l) {
    return function (r) {
      return r(x);
    };
  };
}

module.exports = right;

module.exports.default = right;