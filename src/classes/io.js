'use strict';

module.exports = (function IO() {
  return {
    parent: 'Functor',
    klass: function IO(x) {
      this.$$init(x);
    },
    ext: [
      (function $$init(x) {
        this.id = this.ctor.$id = this.id();
        this.unsafePerformIO = x;
      }),
      (function fx(f) {
        return new this.constructor(f);
      }),
      (function of(x) {
        return new this.constructor(function() {
          return x;
        });
      }),
      (function unit() {
        return this;
      }),
      (function $pure(x) {
        return x ? (x instanceof this.__ ? x : this.constructor.$pure(x)) : this.constructor.$pure;
      }),
      (function $lift(f) {
        return this.constructor.lift(f);
      }),
      (function pure() {
        return this.bind(this.$pure());
      }),
      (function nest() {
        return this.of(this);
      }),
      (function map(f) {
        var thiz = this;
        return this.fx(function(v) {
          return f(thiz.unsafePerformIO(v));
        });
      }),
      (function value(x) {
        return this.pipe().run(x instanceof this.constructor ? x.run() : x);
      }),
      (function filter(f) {
        var thiz = this;
        return this.fx(function(v) {
          return f(v) ? thiz.unsafePerformIO(v) : undefined;
        });
      }),
      (function join() {
        var thiz = this;
        return this.fx(function() {
          return thiz.unsafePerformIO().unsafePerformIO();
        });
      }),
      (function sequence(io) {
        var thiz = this;
        return this.fx(function(v) {
          return thiz.unsafePerformIO(v).ap(io.unsafePerformIO(v)).unit();
        });
      }),                        
      (function bind(f) {
        var thiz = this;
        return this.fx(function(v) {
          return f(thiz.unsafePerformIO()).run(v);
        });
      }),
      (function chain() {
        return this.unsafePerformIO.apply(this, [].slice.call(arguments));
      }),
      (function raf() {
        return this.$fn.raf(Function.prototype.apply.bind(this.unsafePerformIO, this, [].slice.call(arguments)));
      }),
      (function delay() {
        var args = [].slice.call(arguments);
        var time = args.length ? args.shift() : 10;
        return self.setTimeout(Function.prototype.apply.bind(this.unsafePerformIO, this, args), time);
      }),
      (function run() {
        return this.unsafePerformIO.apply(this, [].slice.call(arguments));
      }),
      (function runIO() {
        var args = [].slice.call(arguments);
        if (args.length && args[0] instanceof this.constructor) {
          return this.unsafePerformIO(args.first().run.apply(args.shift(), args));
        }else {
          return this.unsafePerformIO.apply(this, args);
        }
      }),
      (function ap(monad) {
        return this.test(monad) ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
      }),
      (function apply(monad) {
        return monad.ap(this);
      }),
      (function pipe(f) {
        return this.fx(this.$fn.compose(this.unsafePerformIO)(f || this.$pure()));
      }),
      (function lift(f) {
        return f ? this.map(function(v1) {
          return function(v2) {
            return f.call(this, v1, v2);
          };
        }).pure() : this.lift(this.unsafePerformIO);
      }),
      (function curry() {
        return this.fx(this.$fn.curry(this.unsafePerformIO)).pipe();
      }),
      (function liftIO() {
        return this.nest().lift(function(thiz, next) {
          return this.fx(function(ref) {
            return thiz.run(ref).ap(thiz.$pure(next));
          });
        });
      }),
      (function flip() {
        return this.constructor.lift(this.$fn.flip(this.unsafePerformIO));
      }),
      (function prop(name) {
        return this.map(this.$fn.prop(name));
      }),
      (function wrap() {
        return this.$fn.$const(this);
      })
    ],
    attrs: (function() {
      return [].slice.call(arguments);
    })(
      (function of(x) {
        return new this(function() {
          return x;
        });
      }),
      (function pure(x) {
        return x instanceof Function ? new this(x) : this.of(x);
      }),
      (function lift(f) {
        return this.of(function(v1) {
          var thiz = this;
          return this.of(function(v2) {
            return f.call(thiz, v1, v2);
          }).pure();
        }).pure();
      })
    ),
    findType: function(type, name) {
      return type.find(name);
    },
    findStore: function() {
      var find = this.pure(this.$store.db.bin(function(db, uid) {
        return db.find(uid);
      }));
      return find.cache('find', find);
    },
    bindIO: function(io) {
      return io instanceof Function ? this.bindIO(this.fx(io)) : this.fx(this.bin(function(thiz, v) {
        return io.unsafePerformIO(thiz.unsafePerformIO(), v);
      }));
    },
    wrapIO: function(io) {
      return Function.prototype.call.bind(io.unsafePerformIO, io);
    },
    make: function() {
      return {
        klass: [].slice.call(arguments).shift(),
        $$init: function(make) {
          return function(x) {
            this.unsafePerformIO = make(x()).wrapIO();
          }
        },
        make: [].slice.call(arguments).pop(),
        init: function(type, klass, sys) {
          var io = klass.find('io').proto();
          klass.prop('$$init', type.$$init(type.make));
          klass.prop('$pure', io.$pure.bind(io));
          klass.prop('fx', io.fx.bind(io));
          klass.prop('of', io.of.bind(io));
        }
      };
    },
    makeIO: function(make) {
      return function() {
        var args  = [].slice.call(arguments);
        var klass = args[0] instanceof Function ? args.shift() : this.named(args.shift(), false, false, true);
        return this.parse(make(klass, args.pop()));
      }
    },
    propIO: function(prop) {
      return function(x) {
        return this.pure(prop(x));
      }
    },
    funcIO: function(io) {
      return function(v) {
        return io.of(io.run(v));
      }
    },
    init: function(type, klass, sys) {
      klass.prop('wrapIO', sys.$get('utils.call')(type.wrapIO));
      klass.prop('bindIO', type.bindIO);
      klass.attr('make', type.makeIO(type.make));
      klass.prop('funcIO', sys.$get('utils.call')(type.funcIO));
      klass.prop('$fn', Object.assign({
        compose: klass.find('Compose').prop('$fn'),
        enqueue: sys.dispatcher.enqueue,
        raf: sys.dispatcher.animFrame.enqueue,
        flip: sys.$get('utils.flip'),
        prop: sys.$get('utils.property'),
        curry: sys.$get('utils.curry'),
        bind: sys.$get('utils.andThen')(klass.$ctor.$pure)
      }, klass.find('Functor').prop('$fn')));
      klass.$ctor.prop = type.propIO(sys.$get('utils.property'));
      this.root().prop('$find', klass.pure(this.root).lift(type.findType));
      type.findStore.call(klass);
    }
  };
});
