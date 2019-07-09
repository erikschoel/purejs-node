'use strict';

var pure = {
  test() {
    console.log('test');
  }
};

module.exports = pure;

// Allow use of default import syntax in TypeScript
module.exports.default = pure;
