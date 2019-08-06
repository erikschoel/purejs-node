'use strict';

function extract(v) {
  return function $_pure(k) {
    return k(v);
  }
}

module.exports = extract;

module.exports.default = extract;
