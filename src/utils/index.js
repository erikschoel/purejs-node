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
  compose, inherit, mixin, unit, curry, pure, fold, $const, right, left
};

module.exports.default = {
  compose, inherit, mixin, unit, curry, pure, fold, $const, right, left
};
