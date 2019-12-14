'use strict';

var Functor = require('./functor');
var utils = require('../utils');
var dispatcher = require('../core/dispatcher');
var async = require('../core/async');

function cast(v, p) {
  if (v && v instanceof Cont && v.cont) {
    return v.$cont ? v.$cont() : v.cont();
  }else if (v && v instanceof Array && v.cont) {
    return v.cont().cont();
  }else {
    return v && v instanceof Function
      && (p || v.name.substr(-4) == 'cont'
          || v.name.substr(-4) == 'pure'
          || v.name == 'mf') ? v : utils.pure(v);
  }
}
var $cast = utils.andThen(cast);

var Cont = utils.inherit(function Cont(x, f) {
  this._x = cast(x);
  this._f = f || this.mf;
}, Functor, {
  of(x, f) {
    return new this.constructor(x, f);
  },
  mf(t) {
    return function $_pure(f) {
      return f(t);
    }
  },
  $pure(f) {
    return this._f.name == this.constructor.prototype.mf.name ? f : utils.compose(this._f)(f);
  },
  $map(f) {
    return function(v) {
      return v instanceof Function 
      && v.name.substr(-4) == 'pure'
        && (!f.name || f.name.substr(-4) != 'pure' || f.name != 'mf') ? v(f) : f(v);
    }
  },
  $cont() {
    return utils.cont(this._x, this._f);
  },
  map(f) {
    return this.of(this._x, $cast(this.$pure(this.$map(f))));
  },
  bind(f) {
    return this.of(this.$cont(), this.then($cast(f)));
  },
  lazy: async.lazy,
  then: utils.andThen(dispatcher.lazy),
  next: dispatcher.nextTick.next,
  chain(k) {
    // return utils.cont(this._x, this._f)(k);
    return dispatcher.enqueue(this.next(this.$cont())(k || utils.unit));
  },
  run(k) {
    return this.chain(k);
  }
});

Cont.of = function(x, f) {
  return x instanceof Cont ? x : new this(x, f);
}

module.exports = Cont;

module.exports.default = Cont;
