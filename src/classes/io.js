'use strict';

var Ap = require('./ap');
var Functor = require('./functor');
var utils = require('../utils');

var IO = utils.inherit(function IO(f) {
  this.unsafePerformIO = f;
}, Ap, {
  of(x) {
    return this.constructor.of(x);
  },
  map(f) {
    return new this.constructor((v) => {
      return f(this.unsafePerformIO(v));
    });
  },
  bind(f) {
    return new this.constructor((v) => {
      return f(this.unsafePerformIO()).run(v);
    });
  },
  ap(monad) {
    return monad instanceof Functor ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
  },
  lift(f) {
    return f ? this.map(function(v1) {
      return function(v2) {
        return f.call(this, v1, v2);
      };
    }).bind((x) => {
      return new this.constructor.of(x);
    }) : this.lift(this.unsafePerformIO);
  },
  run() {
    return this.unsafePerformIO.apply(this, [].slice.call(arguments));
  }
});

IO.of = function(x) {
  return new IO(x instanceof Function ? x : function() {
    return x;
  });
}
IO.pure = function(f) {
  return new IO(f);
}

module.exports = IO;

module.exports.default = IO;
