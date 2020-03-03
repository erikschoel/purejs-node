'use strict';

module.exports = (function Functor() {
  return {
    klass: function Functor(x) {
      this.id = this.ctor.$id = this.id();
      this._x = x;
    },
    ext: {
      test(value) {
        return value ? ((value instanceof this.__) || (value.__ === this.__)) : false;
      },
      of(x) {
        return new this.constructor(x);
      },
      unit() {
        return this._x;
      },
      chain(f) {
        return typeof this._x.map === 'function' ? this._x.map(f) : f(this._x);
      },
      map(f) {
        return this.of(this.chain(f));
      }
    },
    attrs: [
      function of(x) {
        return x instanceof this ? x : new this(x);
      }
    ],
    init: function(type, klass, sys) {
      klass.prop('$fn', {
        unit: sys.utils.unit,
        compose: sys.utils.compose,
        $const: sys.utils.$const
      });
    }
  };
});
