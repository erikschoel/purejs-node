'use strict';

var Ap = require('./ap');
var Functor = require('./functor');
var utils = require('../utils');

var IO = utils.inherit(function IO(f) {
  this.unsafePerformIO = f;
}, Ap, {
  of: function of(x) {
    return this.constructor.of(x);
  },
  map: function map(f) {
    var _this = this;

    return new this.constructor(function (v) {
      return f(_this.unsafePerformIO(v));
    });
  },
  bind: function bind(f) {
    var _this2 = this;

    return new this.constructor(function (v) {
      return f(_this2.unsafePerformIO()).run(v);
    });
  },
  ap: function ap(monad) {
    return monad instanceof Functor ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
  },
  lift: function lift(f) {
    var _this3 = this;

    return f ? this.map(function (v1) {
      return function (v2) {
        return f.call(this, v1, v2);
      };
    }).bind(function (x) {
      return new _this3.constructor.of(x);
    }) : this.lift(this.unsafePerformIO);
  },
  run: function run() {
    return this.unsafePerformIO.apply(this, [].slice.call(arguments));
  }
});

IO.of = function (x) {
  return new IO(x instanceof Function ? x : function () {
    return x;
  });
};
IO.pure = function (f) {
  return new IO(f);
};

module.exports = IO;

module.exports.default = IO;