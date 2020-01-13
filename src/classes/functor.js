'use strict';

module.exports = (function Functor() {
  return {
    klass: function Functor(x) {
      this.id = this.ctor.$id = this.id();
      this._x = x;
    },
    ext: {
      of(x) {
        return new this.constructor(x);
      },
      unit() {
        return this._x;
      },
      map(f) {
        return typeof this._x.map === 'function' ? this._x.map(f) : f(this._x);
      }
    },
    attrs: [
      function of(x) {
        return x instanceof this ? x : new this(x);
      }
    ]
  };
});
