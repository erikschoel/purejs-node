'use strict';

var keys = require('./keys');
var values = require('./values');
var arrBind = require('./arrBind');
var compose = require('./compose');

function cast(result, values) {
  return result instanceof Array && !(values instanceof Array) && typeof values === 'object' ? keys(values).reduce((acc, key, idx) => ((acc[key] = result[idx]) || true) && acc, {}) : result;
};

function create(bind) {
  return function(iterable) {
    return cast(keys(iterable).map(bind(iterable)), iterable);
  }
};

function parse(result, run) {
  return result instanceof Array ? result.map(run(result)) : (typeof result === 'object' && result.constructor.keys ? keys(result).map(run(result)) : result);
};

function wrap(map) {
  return function run(values) {
    return function(key, index) {
      return cast(parse(map(values[key], key, values, index), run), values[key]);
    };
  }
};

function walk(f) {
  return create(wrap(f));
};


module.exports = walk;

module.exports.default = walk;
