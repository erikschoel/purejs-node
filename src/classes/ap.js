'use strict';

module.exports = (function Ap() {
  return {
    parent: 'Functor',
    klass: function Ap(f) {
      this._f = f;
    },
    ext: {
      of(f) {
        return new this.constructor(f);
      },
      pure(x) {
        return this._f(x);
      },
      ap(x) {
        /* Functor.of just in case */
        return this.__.of(x).map(this._f);
      },
      map(f) {
        return this.of(this.$fn.compose(this._f)(f));
      }
    },
    attrs: [
      function of(f) {
        return new this(f);
      }
    ],
    init: function(type, klass, sys) {
      klass.prop('$fn', {
        compose: sys.utils.compose
      });
    }
  };
});
