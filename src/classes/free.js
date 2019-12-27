'use strict';

var Functor = require('./functor');
var Cont = require('./cont');
var utils = require('../utils');
var threads = require('../core/threads');

function kont(free) {
  return function $_pure(k) {
    free.map(k).run();
  }
};

function of(x) {
  return new this(threads.makeThread(x));
}

var Free = utils.inherit(function Free(x) {
  this._x = x;
}, Functor, {
  of(x) {
    return new this.constructor(x);
  },
  map(f) {
    return this.of(threads.mapThread(this._x, f));
  },
  bind(f) {
    return this.of(threads.bindThread(this._x, threads.makeBind(f).run));
  },
  run() {
    return threads.run(this._x);
  },
  cont() {
    return Cont.of(kont(new this.constructor(this._x)));
  }
}, {
  of: of,
  lift: of
});

module.exports = Free;

module.exports.default = Free;
