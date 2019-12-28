'use strict';

module.exports = (function Cont() {
  return {
    parent: 'Functor',
    klass: function Cont(x, f) {
      this._x = this.cast(x);
      this._f = f || this.mf;
    },
    ext: {
      of(x, f) {
        return new this.constructor(x, f);
      },
      mf(t) {
        return function $_pure(f) {
          return f(t);
        }
      },
      $pure(f) {
        return this._f.name == this.constructor.prototype.mf.name ? f : this.$fn.compose(this._f)(f);
      },
      $map(f) {
        return function(v) {
          return v instanceof Function 
          && v.name.substr(-4) == 'pure'
            && (!f.name || f.name.substr(-4) != 'pure' || f.name != 'mf') ? v(f) : f(v);
        }
      },
      $cont() {
        return this.$fn.cont(this._x, this._f);
      },
      map(f) {
        return this.of(this._x, this.$fn.cast(this.$pure(this.$map(f))));
      },
      bind(f) {
        return this.of(this.$cont(), this.then(this.$fn.cast(f)));
      },
      chain(k) {
        return this.enqueue(this.next(this.$cont())(k || this.$fn.unit));
      },
      run(k) {
        return this.chain(k);
      }
    },
    attrs: [
      function of(x, f) {
        return x instanceof this ? x : new this(x, f);
      }
    ],
    is(ctor) {
      return function(value) {
        return value && value instanceof ctor ? true : false;
      }
    },
    cast(v, p) {
      if (v && this.is(v) && v.cont) {
        return v.$cont ? v.$cont() : v.cont();
      }else if (v && v instanceof Array && v.cont) {
        return v.cont().cont();
      }else {
        return v && v instanceof Function
          && (p || v.name.substr(-4) == 'cont'
              || v.name.substr(-4) == 'pure'
              || v.name == 'mf') ? v : this.$fn.pure(v);
      }
    },
    init: function(type, klass, sys) {
      klass.prop('is', type.is(klass.$ctor));
      klass.prop('cast', type.cast.bind(klass.proto()));
      klass.prop('$fn', {
        cast: sys.utils.andThen(klass.prop('cast')),
        compose: sys.utils.compose,
        cont: sys.utils.cont,
        unit: sys.utils.unit,
        pure: sys.utils.pure
      });
      klass.prop('lazy', sys.async.lazy);
      klass.prop('then', sys.utils.andThen(sys.dispatcher.lazy));
      klass.prop('next', sys.dispatcher.nextTick.next);
      klass.prop('enqueue', sys.dispatcher.enqueue);
    }
  };
});
