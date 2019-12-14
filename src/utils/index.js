'use strict';

var andThen = require('./andThen');
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

module.exports = {
  andThen, compose, inherit, mixin, unit, curry, pure, fold, $const, cont, right, left
};

module.exports.default = {
  andThen, compose, inherit, mixin, unit, curry, pure, fold, $const, cont, right, left
};
