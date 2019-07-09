'use strict';

var Ap = require('./ap');
var Functor = require('./functor');
var utils = require('../utils');

var List = utils.inherit(function List(x) {
  this._x = x;
}, Ap, {
  ap: function ap(x) {
    return this._x.map(function (v) {
      return x.map(function (f) {
        return f(v);
      });
    });
  },
  map: function map(f) {
    return this.of(this._x.map(f));
  },
  fold: function fold(f, a) {
    var acc = utils.fold(f, a);
    this._x.map(function (v) {
      acc = acc(function (next, done) {
        return next(v);
      });
    });
    return acc(function (next, done) {
      return done();
    });
  }
});

List.of = function (x) {
  return new List(x.map instanceof Function ? x : Functor.of(x));
};

module.exports = List;

module.exports.default = List;