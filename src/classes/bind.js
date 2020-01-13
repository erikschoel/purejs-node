'use strict';

module.exports = (function() {
  return {
    klass: function Bind(f, x, m) {
      this.id = this.ctor.$id = this.id();
      if (f) this._f = f;
      if (x) this._x = x;
      if (m) this._m = m;
    },
    ext: [
      (function() {
        var proc = this.$pure.utils.obj({ pure: true, arr: true, val: true, cont: false, other: true, done: true });
        var args = [].slice.call(arguments);

        args.unshift(args.shift().concat([ Object.assign, proc, this.$pure.utils.unit ]).apply());
        args.unshift(args.remove(2).concat([ Object.assign, proc ]).apply());

        // args.unshift(args.remove(1).concat(this.$pure.dispatcher, this.$pure.async).apply());
        // return Object.assign(args.remove(1).shift(), args.reduce((acc, arg) => {
        //   acc[arg.name] = arg;    
        //   return acc;
        // }, {}));

        return args;
      }).call(this,
        (function make() {
          return [].slice.call(arguments);
        })(
          (function wrap(_$_const, _$_close, $wrap, $cont, $collect, $make, $pure, $run, $set, $next, $extend, $proc, $unit) {
            function collect(scheduler, async) {
              return _$_close.call({}, $wrap, $collect, $cont(
                $pure($next, scheduler.$get('nextTick.enqueue')),
                  $run, $set, _$_const, async.lazy, $unit), $extend, $proc, $make);
            };
            collect['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
              r[v.name] = v;
              return r;
            }, {});
            return collect;
          }),
          (function _$_const() {
            return undefined;
          }),
          (function _$_close(wrap, collect, make, extend, proc, run) {
            this.make = make;
            this.wrap = collect(this.make, extend, proc);
            this.collect = wrap(this.wrap, run);
            return this;
          }),
          (function _$_wrap($collect, $make) {
            return function collect(x, p, f) {
              return p || f ? $make($collect(x), p, f) : $collect(x);
            } 
          }),
          (function _$_cont($pure, $run, $set, $empty, $lazy, $unit) {
            return function wrap(x, k, p, f) {
              return $pure(x.slice(0),
                $run(wrap, p), [], $set(x.length, $lazy(k), f || $unit));
            }
          }),
          (function _$_run($run, $extend, $proc) {
            return function run(x) {
              return function $_pure(k, p, f) {
                return $run(x, k, p ? (p.done ? p : $proc.clone(p)) : $proc, f);
              }
            };
          }),
          (function _$_make(x, p, f) {
            return function $_pure(k) {
              return x(k, p, f);
            };
          }),
          (function pure(next, enqueue) {
            return function(x, f, v, s) {
              enqueue(next(x, f, v, s));
            }
          }),
          (function get(run, proc) {
            return function collect(x, s) {
              if (proc.pure && x && x.name == '$_pure' && x instanceof Function) {
                return x(function(r) { collect(r, s); });
              }else if (proc.arr && x instanceof Array) {
                return x.length ? (x.length == 1
                  ? collect(x.shift(), s)
                    : run(x, s, proc))
                  : s(x);
              }else if (proc.val) {
                return s(x);
              }
            };
          }),
          (function set(c, k, f) {
            return function(v, i) {
              return function(r) {
                v[i] = r;
                if (c && !--c) {
                  k(f(v));
                }
              }
            }
          }),
          (function next(x, f, v, s) {
            return function() {
              if (x.length) {
                f(x.shift(), s(v, v.push(undefined) - 1));
              }
              return !x.length;
            }
          })
        ),
        (function each(map, bind) {
          return function each(x, f) {
            return x.chain(bind(map(f)));
          };
        })(
          (function(f) {
            return function(x) {
              return x instanceof Array ? x.flatten().chain(f) : x;
            }
          }),
          (function(f) {
            return function each(x) {
              if (x instanceof Array) {
                return x.map(f);
              }else {
                return x;
              }
            };
          })
        ),
        // === Monadic Bind Array == //
        (function bind() {
          var args = [].slice.call(arguments);
          return function $_bind(extend, proc) {
            return args.append(extend, proc).apply();
          }
        })(
          (function make(main, init, make, bind, $_map, $_make, $_bind, $_wrap, extend, proc) {
            return bind(main($_wrap, extend, proc), init($_map, $_bind), make($_make, $_map));
          }),
          (function main($_wrap, $extend, $proc) {
            function $_main(f, p) {
              return $_wrap(f, !p.done ? $proc.clone(p) : p); // $extend(p, $proc) : p);
            };
            $_main['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
              if (v && v.name && v instanceof Function) r[v.name] = v;
              return r;
            }, {});
            return $_main;
          }),
          (function init($_map, $_bind) {
            return function $_init(w) {
              return $_bind(w, $_map);
            }
          }),
          (function make($_bind, $_map) {
            function $_make(f, x) {
              return $_map(f, x);
            };
            $_make['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
              r[v.name] = v;
              return r;
            }, {});
            return $_make;
          }),
          (function(main, init, make) {
            function bind(f, p) {
              p || (p = this.aid());
              return make(init(main(f, p)), this).aid(p);
            };
            bind['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
              r[v.name] = v;
              return r;
            }, {});
            return bind;
          }),
          (function map(f, x) {
            return x && x instanceof Array ? x.map(f(x)) : x;
          }),
          (function make(x, f, m) {
            return function $_pure(k) {
              return k(m(f, x.slice(1)));
            }
          }),
          (function bind(f, m) {
            return function next(o) {
              return function bound(x, i) {
                return f(x, i, o);//x instanceof Array ? m(next, x) : f(x, i, o);
              };
            };
          }),
          (function $_closed(f, p) {
            return function closed(x, i, o) {
              return function $_pure(k) {
                if (p.pure && x instanceof Function && x.name == '$_pure') {
                  return x(function(r) {
                    return closed(r, i, o)(k);
                  });
                }else if (p.arr && x instanceof Array) {
                  return x.length == 1 ? closed(x.shift(), i, o)(k)
                  : (!x.length ? k(x) : x.map(closed).make(k, p));//x.bind(m(x), p).run(k));
                }else if (p.cont && x && x.$cont instanceof Function && x.$cont.name == '$_cont') {
                  return closed(x.$cont(), i, o)(k);
                }else if (p.val) {
                  return k(f(x, i, o));
                }
              }
            }
          })
        ),
        (function cont() {
          return $pure.klass('Cont').of(this, function(a) {
            return function $_pure(k) {
              return a.wrap(k);
            }
          });
        }),
        (function make(cnst, bind, run) {
          return function make(b, m, c) {
            return bind(run, b, m || unit, c || cnst);
          }
        })(
          (function cnst(v) {
            return function() {
              return v;
            }
          }),
          (function bind(r, b, m, c) {
            return function(f, g) {
              return r(b(f, g, m), g, c);
            }
          }),
          (function run(f, g, c) {
            return function(v, r) {
              r || (r = {});
              return g.run(v).bind(f(r, v, 0)).chain(c(r));
            }
          })
        ),
        (function run(f) {
          return this.make(this._f, this._m)(f, this._x);
        })
      )
    ].shift(),
    attrs: [
      (function pure(f, g, m) {
        return new this.$ctor(f, g, m);
      })
    ],
    make: function(binds) {
      return binds.$set('make', function(type) {
        return function(impl) {
          return binds.$get('data', type)(binds.$get('types', type).run(

            typeof impl == 'string'
              ? binds.$get('impl', type, impl).apply(undefined, [].slice.call(arguments, 1))
                : impl
          ));
        }
      });
    },
    binds: function() {
      return this.assign({
        types: {

          store: this.$pure(function(f, g, m) {

            // f --> effect function
            // g --> input adapter (optional)
            // m --> level change assistant (optional)

            function $next(k, r, l) {
              return function(x) {
                return function(v) {
                  if (r && r.is && r.is(v))
                    return v.vals().bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                  else if (v instanceof Array)
                    return v.bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                  else return v;
                }
              }
            };

            function $kont(l) {
              return function(x, r) {
                return m($bind(x, r, l+1));
              }
            }

            function $bind(x, r, l) {

              return function $fn(v, i, o) {
                var k = r && r.keys ? r.keys(i) : v.name;
                return f(x, v, k, i, r || o)($next(k, r, l), $kont(l));
              };

            };

            return $bind;

          }, this.klass('IO').of(this.klass('Store')).lift(function(node, value) {

            return node.is(value) ? value.vals() : (value instanceof Array ? value : [ value ]);

          }), function(f) {

            return function(x, v, k, i, o) {
              return f(v, i, o);
            }

          }),

          object: this.$pure(function(f, g, m) {

            return function $bind(x, r, l) {

              return function $fn(k, i, o) {
                var v = f(x, r[k], k, i, r, l);
                return v instanceof Array ? v.bind(m(f, (x[k] = {}), k, v, l+1))
                : (typeof v == 'object' && v.constructor.name == 'Object' ? g(v).bind($bind((x[k] = {}), v, l+1)) : v);
              };

            };

          }, this.klass('IO').of(this.klass('Obj')).lift(function(node, value) {

            return node.is(value) ? value.keys()
              : (value instanceof Array ? value
                : (typeof value == 'object' ? Object.keys(value) : [ value ]));

          }), function(f, t, j, x, l) {

            return function(v, i, o) {
              return f(t, v, j, x, l);
            }

          })
        },
        impl: {

          store: {

            fold: function(f) {
              return function(r, v, k, i, o) {
                if (f) {
                  return f(r, v, k, i, o);
                }else if (r instanceof Array) {
                  if (v && v.name) {
                    r.push(v);
                  }else {
                    r[r.push({})-1][k] = v;
                  }
                }else {
                  r[k] = v;
                }
                return v;
              }
            },

            filter: function(expr) {
              return function(r, v, k, i, o) {
                if ((v && typeof v == 'string' && v.like(expr))
                  || (k && typeof k == 'string' && k.like(expr))
                  || (o && o.isStore && o.identifier && o.identifier().like(expr))) {
                  r[k] = v;
                }
                return v;
              }
            },

            info: function() {
              return function(r, v, k, i, o) {
                r[k] = v;
                console.log('Bind', o && o.is ? [ o.identifier(), k, v, i ] : [ v, o, i ]);
                return v;
              }
            }
          },
          object: {

            fold: function(f) {
              return function(r, v, k, i, o) {
                if (f) {
                  r = f(r, v, k, i, o) || r;
                }else if (r instanceof Array) {
                  if (v && v.name) {
                    r.push(v);
                  }else {
                    r[r.push({})-1][k] = v;
                  }
                }else {
                  r[k] = v;
                }
                return v;
              }
            },

            info: function() {
              return function(r, v, k, i, o) {
                r[k] = v;
                console.log(v, k, i);
                return typeof v == 'string' ? ('!!' + v + '!!') : v;
              }
            }
          }
        },
        data: {

          store: function(bind) {

            return function(store) {

              return function(value) {

                return bind(store.store(), value);
              };
            };
          },
          path: function(bind) {

            return function(path, value) {

              return bind(sys.get(path).store(), value).bind(unit);

            };
          },
          object: function(bind) {

            return function(obj, value) {

              return bind(obj, value || {});

            };
          }
        }
      });
    },
    init: (function(wrap, set, make, ext) {
      return function(type, klass, sys) {
        return type.make(type.binds.call(sys.$set('binds', sys.utils.obj({ $pure: klass.$ctor.pure, klass: sys.klass.bind(sys), $ctor: klass.$ctor })), ext(make.call(set(wrap({
          klass: klass,
          scheduler: sys.$get('dispatcher'),
          enqueue: sys.$get('dispatcher.nextTick.enqueue'),
          Cont: sys.klass('Cont').of,
          functor: sys.klass('Functor'),
          maybe: sys.klass('Maybe'),
          list: sys.klass('List'),
          aid: sys.utils.counter(1000000, 'arr'),
          log: sys.utils.log,
          utils: sys.utils,
          async: sys.async
        }))))));
      };
    })(
      (function(ext) {
        ext.cont = ext.utils.andThen(ext.async.cast);
        return ext;
      }),
      (function(ext) {
        var set = ext.klass.prop('collect')(ext.scheduler, ext.async);
        Array.prototype.__      = ext.functor.$ctor;
        // Array.prototype.maybe   = ext.utils.call(ext.maybe.fromConstructor('list'));
        Array.prototype.collect = ext.utils.call2(set.collect);
        Array.prototype.wrap    = ext.utils.pass(set.wrap);
        Array.prototype.make    = ext.utils.call2(set.make);
        Array.prototype.arrid   = ext.aid;
        // Array.prototype.info    = ext.utils.call(sys.get('utils.point.map')(ext.log));
        Array.prototype.klass   = ext.functor.find;
        Array.prototype.to      = ext.functor.to;
        Array.prototype.functor = ext.utils.call(ext.functor.pure);
        return ext;
      }),
      (function() {
        Array.prototype.aid = function(aid) {
          return aid && (this._aid = aid) ? this : (this._aid || (this._aid = { aid: this.arrid() }));
        };
        Array.prototype.each    = this.utils.call1(this.klass.prop('each'));
        Array.prototype.bind    = this.klass.prop('bind');
        Array.prototype.next    = this.utils.call2(this.async.next);
        Array.prototype.combine = this.utils.call2(this.async.combine);
        Array.prototype.target  = this.utils.target;
        Array.prototype.select  = this.async.select;
        Array.prototype.dequeue = this.utils.atom(function(f) {
          return f ? f() : null;
        }, function(x) {
          return x.shift();
        });
        Array.prototype.call = function() {
          return (function() {
            return this.arr.length ? this.fn(this.arr.shift()) : null;
          }).bind({ arr: this, fn: [].slice.call(arguments).shift() || unit });
        };
        Array.prototype.ap = function() {
          var args = [].slice.call(arguments);
          if (args.length > 1) {
            return this.combine(function(x, y) {
              return y.run(x);
            }, args);
          }else {
            return [ function(a, x) {
              return a.bind(function(v, i) {
                return x.run(v, i);
              });
            }, this, args.shift() ].apply();
          }
        };
        Array.prototype.lift = function(f) {
          return [ this.fmap(function(xs) {
            return f.apply(undefined, xs);
          }) ];
        };
        Array.prototype.fold = function(f, r) {
          return [ this.fmap(function(xs) {
            return f.apply(undefined, xs);
          }) ];
        };
        Array.prototype.flatten = function() {
          return this.flatmap(this.unit);
        };
        Array.prototype.chain = function(f) {
          return [ this.fmap(function(r) {
            return f(r && r.length == 1 ? r.first() : r);
          }) ];
        };
        // Array.prototype.list = this.utils.call(this.list.fromConstructor('list'));
        return this;
      }),
      (function(ext) {
        Array.prototype.unit = ext.utils.unit;
        Array.prototype.run = function(/* k, o, f */) {
          var args = [].slice.call(arguments), k, o, f;
          while (args.length) {
            if (typeof args[0] == 'object') o = args.shift();
            else if (args[0] instanceof Function) {
              if (!k) k = args.shift(); if (!f && args[0] instanceof Function) f = args.shift();
            }else {
              args.shift();
            }
          }
          o || (o = {}); o.aid || (o.aid = this.arrid());
          return (f ? this.bind(f, o) : this).wrap(ext.async.get(k || this.unit), o);
        };
        Array.prototype.fmap = function(f, p) {
          return ext.async.then(this.collect(p), ext.cont(f));
        };
        Array.prototype.flatmap = function(f) {
          return this.bind(f).chain(ext.async.flatmap(this.unit));
        };
        Array.prototype.cont = function() {
          return this.length == 1 && this[0] instanceof Function && this[0].name == '$_pure'
          ? ext.Cont(this.first()) : ext.Cont(this.collect(), function(r) {
            return function $_pure(k) {
              return k(r && r.length == 1 ? r.first() : r);
            }
          });
        };
        Array.prototype.kont = function() {
          return this.cont().cont();
        };
        return ext;
      })
    )
  };
});
