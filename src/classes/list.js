'use strict';

var Ap = require('./ap');
var Functor = require('./functor');
var utils = require('../utils');

var List = utils.inherit(function List(x) {
  this._x = x;
}, Ap, {
  ap(x) {
    return this._x.map((v) => {
      return x.map((f) => {
        return f(v);
      });
    });
  },
  map(f) {
    return this.of(this._x.map(f));
  },
  fold(f, a) {
    let acc = utils.fold(f, a);
    this._x.map((v) => {
      acc = acc(function(next, done) {
        return next(v);
      });
    });
    return acc(function(next, done) {
      return done();
    });
  }
});

List.of = function(x) {
  return new List(x.map instanceof Function ? x : Functor.of(x));
}

module.exports = List;

module.exports.default = List;
