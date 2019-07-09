'use strict';

function fold(f, x) {
  function run(acc) {
    return function (kont) {
      /* kont determines whether to run next or return the result */
      return kont(function (value) {
        return run(f(acc, value));
      }, function () {
        return acc;
      });
    };
  }
  return run(x);
}

module.exports = fold;

module.exports.default = fold;