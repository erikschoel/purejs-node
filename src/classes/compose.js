'use strict';

module.exports = (function Compose() {
  return (function(klass, ext, attrs) {
    return { parent: 'Functor', klass: klass, ext: ext, attrs: attrs };
  })(
    (function Compose(f) {
      this.id = this.ctor.$id = this.id();
      this.$$init(f);
    }),
    (function() {
      return [].slice.call(arguments);
    })(
      (function MakeCompose(make, just, next) {
        return make(just, next);
      })(
        (function make(just, next) { 
          return function $fn(f) {
            return function $_compose(g) {
              return g ? (g.name == 'unit' ? just(f) : (f.name == 'unit' ? just(g) : next(f, g))) : just(f);
            };
          };
        }),
        (function just(f) {
          return function $_just(a) {
            return f(a);
          }
        }),
        (function next(f, g) {
          return function $_next(a) {
            return g(f(a));
          };
        })
      ),
      (function $$init(f) {
        this._f = this.$$cmps(f);
      }),
      (function $$cmps(f) {
        return !f && typeof f == 'undefined' ? unit : (f instanceof Function && f.length > 1 ? this.fn.curry(f) : f);
      }),
      (function ap(monad) {
        return monad.map ? monad.map(this.$fn(this._f)(this.unit)) : this.ap(this.of(monad));
      }),
      (function apply(monad) {
        return monad.ap(this);
      }),
      (function map(f) {
        return this.of(this.$fn(this._f)(f));
      }),
      (function chain(v) {
        return this.$fn(this._f)(this.unit)(v);
      }),
      (function run(v) {
        return this.chain(v);
      })
    ),
    (function() {
      return [].slice.call(arguments);
    })(
      (function of(f) {
        return new this(f);
      })
    )
  );
});
