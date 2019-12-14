'use strict';

function cont(mv, mf) {
  return function $_pure(continuation) {
    return mv(function(value) {
      return mf(value)(continuation);
    });
  }
}

module.exports = cont;

module.exports.default = cont;
