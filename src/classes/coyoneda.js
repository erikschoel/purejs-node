'use strict';

module.exports = (function Coyoneda() {
  return {
    parent: 'Functor',
    klass: function Coyoneda(x, f) {
      this._x = x;
      this._f = f;
    },
    ext: {
      of(x, f) {
        return new this.constructor(x, f);
      },
      map(f) {
        return this.of(this._x, this.$fn.compose(f)(this._f));
      },
      lower() {
        return this._x.map(this._f);
      }
    },
    attrs: [
      function of(x) {
        return new this(this.ctor.parent().of(x), this.prototype.$fn.unit);
      },
      function lift(x) {
        return new this(this.ctor.parent().of(x), this.prototype.$fn.unit);
      }
    ]
  };
});
