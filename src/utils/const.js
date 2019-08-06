'use strict';

function $const(a) {
  return function() {
    return a;
  }
}

module.exports = $const;

module.exports.default = $const;
