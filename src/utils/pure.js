'use strict';

function pure(t) {
  return function $_pure(f) {
    return f(t);
  }
}

module.exports = pure;

module.exports.default = pure;
