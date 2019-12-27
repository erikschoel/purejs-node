'use strict';

var keys = require('./keys');

function values(x) {
  return typeof x === 'object' ? keys(x).map(k => x[k]) : x;
}

module.exports = values;

module.exports.default = values;
