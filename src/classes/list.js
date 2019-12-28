'use strict';

module.exports = (function List() {
  return {
    parent: 'Ap',
    klass: function List(x) {
      this._x = x;
    },
    ext: {
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
        let acc = this.$fn.fold(f, a);
        this._x.map((v) => {
          acc = acc(function(next, done) {
            return next(v);
          });
        });
        return acc(function(next, done) {
          return done();
        });
      }
    },
    attrs: [
      function of(x) {
        return new this(x.map instanceof Function ? x : this.ctor.find('Functor').of(x));
      }
    ],
    init: function(type, klass, sys) {
      klass.prop('$fn', {
        fold: sys.utils.fold
      });
    }
  };
});
