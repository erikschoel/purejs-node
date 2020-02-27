'use strict';

var dispatcher = require('./dispatcher');
var utils = require('../utils');

var async = utils.arrApply((function MakeAsync() {
  return [].slice.call(arguments);
})(
  // === IMPORT / PARSE === //
    (function $$ASYNC(lazy, then, frcb, arr) {
      var $proc  = dispatcher;
      var $async = utils.obj(arr);
      // var $cont   = this.klass('Cont');

      $async.$set('lazy', lazy($proc, 'nextTick.enqueue'));
      // $cont.prop('lazy', $async.set('lazy', lazy(process, 'nextTick.enqueue')));
      $async.$set('then', then($async.$get('lazy')));
      // $cont.prop('then', utils.get('andThen')(process.get('lazy')));
      utils.$set('fromCallback', frcb.call($proc));

      return $async;
    }),
    (function scheduledBindWrap() {
      return utils.arrApply([].slice.call(arguments));
    })(
      (function wrapDispatcher(wrap, make, start, cont, done, pure) {
        return function bindDispatch(scheduler, timer) {
          var wrapped = scheduler.$set('wrapped', wrap(scheduler));
          scheduler.$set('lazy', wrapped(make(pure, cont, timer)));
          return wrapped(make(done, start, timer));
        }
      }),
      (function WrapTimers(scheduler) {
        return function $schedulerWrap(fn) {
          return fn(scheduler);
        }
      }),
      (function MakeWrap(wrapper, starter, path) {
        return function(scheduler) {
          return starter(scheduler.$get(path), wrapper);
        }
      }),
      (function StartWrap(schedule, wrapper) {
        return function enqueue(succ) {
          return function $_cont(result) {
            return schedule(wrapper(succ, result));
          }
        }
      }),
      (function ContWrap(schedule, wrapper) {
        return function lazyR(result) {
          return function $_pure(succ) {
            return schedule(wrapper(succ, result));
          }
        }
      }),
      (function $_next(succ, result) {
        return function() {
          return succ(result) || true;
        };
      }),
      (function $_pure(succ, pure) {
        return function() {
          return pure(succ) || true;
        };
      })
    ),
    (function monadicBindWrap() {
      return utils.arrApply([].slice.call(arguments));
    })(
      (function makeBind(make, box) {
        return function then(enqueue) {
          return make(box, enqueue);
        }
      }),
      (function make(box, enqueue) {
        return function then(x, f) {
          return function $_pure(succ, fail) {
            return x(box(f, enqueue(succ), fail), fail);
          }
        };
      }),
      (function box(f, succ, fail) {
        return function(t) {
          return f(t)(succ, fail);
        };
      })
    ),
    (function fromCallback(run, list, make, wrap, tick) {
      return function $_fromCallback() {
        return make(list(run, this.$get('nextTick.enqueue')), wrap(tick));
      }
    })(
      (function $run(tick, enqueue, list) {
        return function run() {
          if (!(list.length * list.push.apply(list, Array.prototype.slice.call(arguments))))
            enqueue(tick);
          if (!arguments.length) return run;
        };
      }),
      (function $list(run, enqueue) {
        return function(tick) {
          return function(list) {
            return run(tick, enqueue, list);
          };
        };
      }),
      (function $make(next, from) {
        return function fromCallback(continuation) {
          var arr = [];
          return next(from(arr)(continuation))(arr);
        };
      }),
      (function $wrap(fn) {
        return function(arg1) {
          return function(arg2) {
            return fn(arg1, arg2);
          };
        };
      }),
      (function $tick(arr, continuation) {
        return function tick() {
          if (arr.length) continuation(arr.shift());
          return !arr.length;
        };
      })
    ),
    (function() {
      return utils.parseFuncs([].slice.call(arguments), { pure: utils.pure });
    })(
    // ===== AsyncFN ===== //
      (function pure(t) {
        return function $_pure(f) {
          return f(t);
        }
      }),
      (function cast(t) {
        return t && t instanceof Function && t.name.substr(-4) == 'pure' ? t : function $_pure(f) {
          return f(t);
        }
      }),
      (function inject(f) {
        return function $_pure(succ, fail) {
          succ(f());
        };
      }),
      (function eject(x, f) {
        return function $_pure(succ, fail) {
          x(function(result) {
            succ(f(result));
          }, fail);
        };
      }),
      (function count(cnt, block) {
        return function $_pure(succ, fail) {
          var i = 0;
          (function f(v) {
            i++ < cnt ? block(i)(f, fail) : succ(v);
          })(undefined);
        };
      }),
      (function $_times($_count) {
        return function times(cnt, block) {
          return $_count(cnt, function() {
            return block;
          });
        };
      }),
      (function delay(x, ms) {
        return function $_pure(k) {
          x(function(v) {
            ms ? self.setTimeout(function() {
              k(v);
            }, ms) : k(v);
          });
        };
      }),
    // ===== AsyncAP ===== //
      (function ap(f, x) {
        return function $_pure(succ, fail) {
          var _f;
          var _x;
          var count = 0;
          function fin() {
            if (++count === 2)
              succ(_f(_x));
          }
          f(function (g) {
            _f = g;
            fin();
          }, fail);
          x(function $_pure(r) {
            _x = r;
            fin();
          }, fail);
        };
      }),
      (function get(f) {
        return function(r) {
          return f(r && r instanceof Array && r.length == 1 ? r.first() : r);
        }
      }),
    // ===== AsyncFMAP ===== //
      (function $_fmap($_ap, $_pure) {
        return function fmap(xs, f) {
          return $_ap($_pure(f), xs);
        };
      }),
    // === FlatMap Bind Array == //
      (function flatmap() {
        return utils.arrApply([].slice.call(arguments));
      })(
        (function make($_flat) {
          return function flatmap(k, f) {
            return $_flat(k, f || utils.unit);
          };
        }),
        (function() {
          function flat(x, f) {
            return Array.prototype.concat.apply([], x.map(f));
          };
          function bind(f) {
            function bound(x) {
              return x instanceof Array ? flat(x, bound) : (typeof x === 'object' && x.$$bind && x.constructor.name === 'Object' ? flat(Object.values(x), bound) : f(x));
            };
            return bound;
          };
          return function(k, f) {
            return function(v) {
              return k(flat(v instanceof Array ? v : [ v ], bind(f)));
            }
          };
        })()
      ),
      (function $combine(create, init, load, make) {
        var combine = create(load, init, make);
        combine['$$_scope'] = { make: make };
        return combine;
      })(
        (function create(load, init, make) {
          return function combine(x, f) {
            x.load = load(init(f), make);
            return x;
          }
        }),
        (function init(f) {
          return function $load(c, j, l) {
            return function $$map(t, v, d, p, o) {
              if (c === l) c = 0;
              return t.map(function(x, y) {
                return x instanceof Array ? $load(0, j, x.length - 1)(x, v, d + 1, { pos: p.pos.concat(y), rel: 0 }) : f(v, x, d + (!j ? ++c : c), { pos: p.pos, rel: y }, j++);
              });
            };
          }
        }),
        (function load(func, make) {
          return function(arr) {
            return this.bind(make(func(-1, 0, Math.max(this.length - 1, 0)))(arr));
          };
        }),
        (function make(map) {
          return function $map(t) {
            return function(v, i, o) {
              return map(t, v, 0, { pos: [ i ], rel: 0 }, o);
            }
          };
        })
      ),
      (function select() {
        return utils.arrApply([].slice.call(arguments));
      })(
        (function make($_const, $_filtered, $_select) {
          function select(f, m) {
            return this.chain($_select($_filtered(f || $_const, m || utils.unit)));
          };
          select['$$_scope'] = { '$_filtered': $_filtered, '$_select': $_select };
          return select;
        }),
        (function konst() {
          return true;
        }),
        (function(f, m) {
            function $map(x) {
                return (x instanceof Array ? x : [ x ]).map(function(v) {
                    return (v instanceof Array ? v : (typeof v === 'object' && v.$$obj ? Object.values(v) : m(v)));
                });
            };
            function $filter(x) {
                return (x instanceof Array ? x : [ x ]).map(function(v) {
                    return v instanceof Array ? v : (typeof v === 'object' && v.$$obj ? Object.values(v) : v);
                }).filter(function(v, i) {
                    return v instanceof Array || f(v, i);
                });
            };
            return function $run(x) {
                var o = x.aid();
                return x.chain($filter).collect(o, function(r) {
                    return r.map($map);
                });
            };
        }),
        (function(f) {
            return function $_select(x) {
                if (x instanceof Array) {
                    return x.map($_select).chain(f);
                }else {
                    return x;//typeof x === 'object' ? $_select(Object.values(x)) : x;
                }
            };
        })
      ),
      (function array(xs) {
        return function $_pure(succ, fail) {
          var values = new Array(xs.length);
          var count  = 0;
          xs.forEach(function(x, i) {
            x(function(result) {
              values[i] = result;
              count++;
              if (count == xs.length) {
                succ(values);
              }
            }, fail);
          });
        };
      }),
      (function $_collect($_array) {
        return function collect() {
          return $_array([].slice.call(arguments));
        }
      }),
      (function $_parallel($_array) {
        return function parallel() {
          var args = [].slice.call(arguments);
          return function $_pure(succ, fail) {
            $_array(args)(function(_args) {
              return succ(_args);
            }, fail);
          };
        }
      }),
      (function(run, series) {
        return function $_series() {
          return series(utils.y(run));
        }
      })(
        (function(loop) {
          return function run(xs) {
            xs[0][0].length == 0 ? xs.pop().splice(0, 2).shift()(xs.shift().pop()) : xs[0][0][0](function (r) {
              xs[0][1][xs[0][1].length] = r;
              xs[0][0].shift();
              return loop(xs);
            }, xs[1][1]);
          }
        }),
        (function(seriesY) {
          return function series() {
            return (function(xs) {
              return function $_pure(succ, fail) {
                return seriesY([ [ xs.slice(0), new Array(xs.length) ], [ succ, fail ] ]);
              };
            })([].slice.call(arguments));
          }
        })
      )
    )
  )
);

module.exports = async;

// Allow use of default import syntax in TypeScript
module.exports.default = async;
