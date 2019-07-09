'use strict';

function Functor(x) {
  this._x = x;
}
Functor.prototype.of = function (x) {
  return new this.constructor(x);
};
Functor.prototype.map = function (f) {
  return this.of(typeof this._x.map === 'function' ? this._x.map(f) : f(this._x));
};

Functor.of = function (x) {
  return new Functor(x);
};

module.exports = Functor;

module.exports.default = Functor;