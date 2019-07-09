'use strict';

var Functor = require('./functor');
var utils = require('../utils');

var Coyoneda = utils.inherit(function Coyoneda(x, f) {
  this._x = x;
  this._f = f;
}, Functor, {
  of: function of(x, f) {
    return new this.constructor(x, f);
  },
  map: function map(f) {
    return this.of(this._x, utils.compose(f)(this._f));
  },
  lower: function lower() {
    return this._x.map(this._f);
  }
});

Coyoneda.of = Coyoneda.lift = function (x) {
  return new Coyoneda(Functor.of(x), utils.unit);
};

module.exports = Coyoneda;

module.exports.default = Coyoneda;