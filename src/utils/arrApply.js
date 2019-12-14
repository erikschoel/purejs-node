'use strict';

function arrApply(arr) {
  return arr.shift().apply(null, arr);
}

module.exports = arrApply;

module.exports.default = arrApply;
