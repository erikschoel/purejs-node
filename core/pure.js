'use strict';

var classes = require('../classes');
var utils = require('../utils');

var pure = {
  klass: function klass(name) {
    return classes[name];
  },

  unit: utils.unit,
  pure: utils.pure,
  curry: utils.curry,
  utils: utils
};

module.exports = pure;

// Allow use of default import syntax in TypeScript
module.exports.default = pure;