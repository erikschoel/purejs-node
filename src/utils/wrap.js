'use strict';

function wrap(obj) {
  return function get() {
    return obj.$get.apply(obj, [].slice.call(arguments));
  }
}

module.exports = wrap;

module.exports.default = wrap;
