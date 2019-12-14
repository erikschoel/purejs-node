'use strict';

var andThen = require('./andThen');
var arrApply = require('./arrApply');
var compose = require('./compose');
var inherit = require('./inherit');
var mixin = require('./mixin');
var unit = require('./unit');
var curry = require('./curry');
var pure = require('./pure');
var fold = require('./fold');
var $const = require('./const');
var cont = require('./cont');
var right = require('./right');
var left = require('./left');

var Obj = inherit(function Obj(v) {
  if (v) mixin(v, this);
}, Object, {
  $get(key) {
    return key ? key.split('.').reduce((acc, key) => {
      return acc[key];
    }, this) : this;
  },
  $set(key, value) {
    return this[key] = value;
  }
});

Obj.of = function(v) {
  return new Obj(v);
};

var utils = Obj.of({
  obj: Obj.of, andThen, arrApply, compose, inherit, mixin, unit, curry, pure, fold, $const, cont, right, left
});

module.exports = utils;
module.exports.default = utils;
