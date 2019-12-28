'use strict';

module.exports = (function IO() {
  return {
    parent: 'Ap',
    klass: function IO(f) {
      this.unsafePerformIO = f;
    },
    ext: {
      of(x) {
        return this.constructor.of(x);
      },
      map(f) {
        return new this.constructor((v) => {
          return f(this.unsafePerformIO(v));
        });
      },
      bind(f) {
        return new this.constructor((v) => {
          return f(this.unsafePerformIO()).run(v);
        });
      },
      ap(monad) {
        return monad instanceof this.__ ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
      },
      lift(f) {
        return f ? this.map(function(v1) {
          return function(v2) {
            return f.call(this, v1, v2);
          };
        }).bind((x) => {
          return new this.constructor.of(x);
        }) : this.lift(this.unsafePerformIO);
      },
      run() {
        return this.unsafePerformIO.apply(this, [].slice.call(arguments));
      }
    },
    attrs: [
      function of(x) {
        return new this(x instanceof Function ? x : function() {
          return x;
        });
      },
      function pure(f) {
        return new this(f);
      }
    ]
  };
});
