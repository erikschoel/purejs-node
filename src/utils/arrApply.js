'use strict';

function arrApply(arr, ctx) {
  return arr.shift().apply(ctx || null, arr);
}

module.exports = arrApply;

module.exports.default = arrApply;
