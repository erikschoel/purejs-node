'use strict';

var Functor = require('./functor');
var utils = require('../utils');

var Ap = utils.inherit(function Ap(f) {
  this._f = f;
}, Functor, {
  of(f) {
    return new this.constructor(f);
  },
  pure(x) {
    return this._f(x);
  },
  ap(x) {
    /* Functor.of just in case */
    return Functor.of(x).map(this._f);
  },
  map(f) {
    return this.of(utils.compose(this._f)(f));
  }
});

Ap.of = function(f) {
  return new Ap(f);
}

module.exports = Ap;

module.exports.default = Ap;
