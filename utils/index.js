'use strict';

var compose = require('./compose');
var inherit = require('./inherit');
var mixin = require('./mixin');
var unit = require('./unit');
var curry = require('./curry');
var pure = require('./pure');
var fold = require('./fold');
var $const = require('./const');
var right = require('./right');
var left = require('./left');

module.exports = {
  compose: compose, inherit: inherit, mixin: mixin, unit: unit, curry: curry, pure: pure, fold: fold, $const: $const, right: right, left: left
};

module.exports.default = {
  compose: compose, inherit: inherit, mixin: mixin, unit: unit, curry: curry, pure: pure, fold: fold, $const: $const, right: right, left: left
};