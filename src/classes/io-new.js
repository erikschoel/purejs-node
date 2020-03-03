'use strict';

module.exports = (function IO() {
  return {
    parent: 'Ap',
    klass: function IO(f) {
      this.id = this.ctor.$id = this.id();
      this.unsafePerformIO = f;
    },
    ext: {
      of(x) {
        return this.constructor.of(x);
      },
      $pure(x) {
        return x ? (x instanceof this.__ ? x : this.constructor.$pure(x)) : this.constructor.$pure;
      },
      pure() {
        return this.bind(this.$pure());
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
          return new this.constructor(x);
        }) : this.lift(this.unsafePerformIO);
      },
      wrap() {
        return this.$fn.$const(this);
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
      },
      (function lift(f) {
        return this.of(function(v1) {
          var thiz = this;
          return this.of(function(v2) {
            return f.call(thiz, v1, v2);
          }).pure();
        }).pure();
      })
    ],
    atom(io) {
      return Function.prototype.call.bind(io.unsafePerformIO, io);
    },
    lift(x) {
      return this.$ctor.lift(x);
    },
    $lift(f) {
      return this.constructor.lift(f);
    },
    init(type, klass, sys) {
      const ctor = klass.$ctor;
      klass.attr('lift', type.lift);
      klass.prop('$lift', type.$lift);
      klass.prop('atom', sys.$get('utils.call')(type.atom));
    }
  };
});
