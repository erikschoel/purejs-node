'use strict';

module.exports = (function Maybe() {
  return {
    parent: 'Functor',
    klass: function Maybe(x) {
      this.id = this.ctor.$id = this.id();
      if (x || typeof x != 'undefined') this._x = x;
    },
    ext: [
      (function prop() {
        var args = Array.prototype.slice.call(arguments);
        return this.map(this.$fn.prop(args.shift()).apply(undefined, args));
      }),
      (function get(key) {
        return this.map(this.$fn.pget(key));
      }),
      (function values(recur) {
        return this.map(this.$fn.pval(recur));
      }),
      (function find(key) {
        return this.map(this.$fn.pfind(key));
      }),
      (function isValue(value) {
        return this.$isNothing(value) ? null : { value: value };
      }),
      (function $isNothing(v) {
        return v === null || v === undefined || v === false;
      }),
      (function isNothing() {
        return this._x === null || this._x === undefined || this._x === false;
      }),
      (function isSome() {
        return !this.isNothing();
      }),
      (function ifSome(mf) {
        return this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
      }),
      (function ifNone(mf) {
        return !this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
      }),
      (function filter(f) {
        return this.map(function(v) {
          if (f(v)) return v;
        });
      }),
      (function chain(f) {
        if (f instanceof Function) {
          return this.ifSome(f || unit);
        }else if (this._x instanceof Function) {
          return this.ifSome(this.$fn.pure(f));
        }else {
          return this.ifSome(f);
        }
      }),
      (function orElse(mv, ctx) {
        return this.isNothing() ? new this.constructor(mv instanceof Function ? mv.call(ctx) : mv) : this;
      }),
      (function map(mf) {
        return this.ctor.of(this.chain(mf));
      }),
      (function run(f) {
        return this.chain(f || unit);
      }),
      (function ap(other) {
        return this.is(other) ? this.map(function(x) {
          return x instanceof Function ? (this.test(other) ? other.chain(x) : other.map(x)) : (x.ap ? x.ap(other) : other.run(x));
        }) : (other instanceof Function ? this.of(other).ap(this._x) : this.ap(this.of(other)));
      }),
      (function apply(other) {
        return other.ap(this);
      }),
      (function unit() {
        return this._x;
      }),
      (function join() {
        return this._x;
      }),
      (function toIO() {
        return this.chain(this.$fn.io.pure);
      }),
      (function isIO() {
        return this.chain(function(x) {
          return this.$fn.io.is(x);
        });
      }),
      (function toMaybeIO() {
        return this.$fn.io.of(this).lift(function(mbfn, value) {
          return mbfn.chain(function(fn) {
            return this.of(value).chain(fn);
          });
        });
      })
    ],
    attrs: [
      (function of(x) {
        return x && x instanceof this ? x : new this(x);
      }),
      (function list(x) {
        return this.of(x.map(this.ctor.of).filter(function(x) {
          return x.isSome();
        })).filter(function(x) {
          return x.length;
        }).map(function(x) {
          return x instanceof Array ? x.map(item => item instanceof this.__ ? item.unit() : item) : x;
        });
      }),
      (function pure(x) {
        return new this(x);
      })
    ],
    toMaybe: function($maybe) {
      return function() {
        return this.map($maybe.of);
      }
    },
    runMaybe: function($maybe) {
      return function(v) {
        return $maybe.of(this.run(v));
      }
    },
    maybe: function($maybe) {
      return function(cache) {
        return cache !== false ? (this._maybe || (this._maybe = $maybe.of(this))) : $maybe.of(this);
      }
    },
    lookup: function($maybe) {
      return function() {
        var args = [].slice.call(arguments).flat().filter(unit);
        return args.length ? this.lookup(args.join('.')) : (this._maybe || (this._maybe = $maybe.of(this)));
      }
    },
    cont: function() {
      return this.chain(this.$fn.cont.pure);
    },
    init: function(type, klass, sys) {
      var root = this.$store.root, utils = sys.utils;
      var prop = utils.$get('property');
      var IO   = this.find('IO');
      klass.prop('$fn', {
        prop: prop,
        pget: prop('get'),
        pval: prop('values'),
        pfind: prop('find'),
        pure: sys.$get('async.pure'),
        io: IO, cont: this.find('Cont')
      });
      klass.prop('curry', utils.$get('curry'));
      this.find('Functor').prop('toMaybe',  type.toMaybe(klass));
      IO.prop('runMaybe', type.runMaybe(klass));
      IO.prop('$fn').maybe = klass.of;
      this.$store.constructor.prototype.maybe = type.lookup(klass);
    }
  };
});
