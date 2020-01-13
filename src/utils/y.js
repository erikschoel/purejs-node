'use strict';

function y(r) {
  return (function (f) {
    return f(f);
  })(function (f) {
    return r(function (x) {
      return f(f)(x);
    });
  });
};

module.exports = y;

module.exports.default = y;
